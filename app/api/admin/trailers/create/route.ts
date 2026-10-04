import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidateCatalogPages } from "@/lib/admin/revalidate-catalog";
import {
  parseTrailerCategoryIds,
  syncTrailerCategories,
} from "@/lib/admin/trailer-categories";
import {
  nullableInteger,
  nullableNumber,
  nullableText,
  parseSimpleDimensions,
  trailerTiltType,
} from "@/lib/admin/trailer-characteristics";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await hasAdminSession())) {
      return NextResponse.json(
        { success: false, error: "Niste prijavljeni." },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const brand = (formData.get("brand") as string) || "Vesta";
    const model = (formData.get("model") as string) || "";
    const title = (formData.get("title") as string) || `${brand} ${model}`;
    const categoryIds = parseTrailerCategoryIds(formData);
    if (categoryIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Izaberite najmanje jednu filter kategoriju." },
        { status: 400 }
      );
    }
    const categoryId = categoryIds[0];
    const priceRsd = parseFloat((formData.get("price_rsd") as string) || "0") || 0;
    const priceEur = formData.get("price_eur")
      ? parseFloat(formData.get("price_eur") as string)
      : null;
    const oldPriceRsd = formData.get("old_price_rsd")
      ? parseFloat(formData.get("old_price_rsd") as string)
      : null;
    const status = (formData.get("status") as string) || "available";

    const isBCategory = formData.get("is_b_category") === "on";
    const isBraked = formData.get("is_braked") === "on";
    const axlesCount = nullableInteger(formData, "axles_count");
    const tiltType = trailerTiltType(formData);
    const hasTilt = tiltType !== null;
    const hasSupportWheel = formData.get("has_support_wheel") === "on";
    const hasWinch = formData.get("has_winch") === "on";
    const hasRamps = formData.get("has_ramps") === "on";
    const isFeatured = formData.get("is_featured") === "on";

    const grossWeightKg = nullableNumber(formData, "gross_weight_kg");
    const curbWeightKg = nullableNumber(formData, "curb_weight_kg");
    const payloadCapacityKg = nullableNumber(formData, "payload_capacity_kg");
    const realPayloadCapacityKg = nullableNumber(formData, "real_payload_capacity_kg");
    const loadingHeightMm = nullableNumber(formData, "loading_height_mm");
    const warrantyMonths = nullableInteger(formData, "warranty_months");
    const cargoSpaceDimensions = nullableText(formData, "cargo_space_dimensions");
    const externalDimensions = nullableText(formData, "external_dimensions");
    const internal = parseSimpleDimensions(cargoSpaceDimensions);
    const external = parseSimpleDimensions(externalDimensions);

    const suspension = nullableText(formData, "suspension");
    const wheelSpecs = nullableText(formData, "wheel_specs");
    const chassis = nullableText(formData, "chassis");
    const floorType = categoryIds.includes("nautika-camci")
      ? null
      : nullableText(formData, "floor_type");
    const sideMaterial = nullableText(formData, "side_material");
    const sidesOpening = nullableText(formData, "sides_opening");

    const description = (formData.get("description") as string) || null;

    const slugBase = `${brand}-${model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

    const { data: trailer, error } = await supabaseAdmin
      .from("povuci_trailers")
      .insert({
        brand,
        model,
        title,
        slug,
        category_id: categoryId,
        price_rsd: priceRsd,
        price_eur: priceEur,
        old_price_rsd: oldPriceRsd,
        status,
        is_b_category: isBCategory,
        is_braked: isBraked,
        axles_count: axlesCount,
        has_tilt: hasTilt,
        tilt_type: tiltType,
        has_support_wheel: hasSupportWheel,
        has_winch: hasWinch,
        has_ramps: hasRamps,
        is_featured: isFeatured,
        gross_weight_kg: grossWeightKg,
        curb_weight_kg: curbWeightKg,
        payload_capacity_kg: payloadCapacityKg,
        real_payload_capacity_kg: realPayloadCapacityKg,
        warranty_months: warrantyMonths,
        cargo_space_dimensions: cargoSpaceDimensions,
        external_dimensions: externalDimensions,
        internal_length_mm: internal.length,
        internal_width_mm: internal.width,
        internal_height_mm: internal.height,
        external_length_mm: external.length,
        external_width_mm: external.width,
        external_height_mm: external.height,
        loading_height_mm: loadingHeightMm,
        suspension,
        wheel_specs: wheelSpecs,
        chassis,
        floor_type: floorType,
        side_material: sideMaterial,
        sides_opening: sidesOpening,
        description,
        main_image_url: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json(
        { success: false, error: `Greška pri upisu u bazu: ${error.message}` },
        { status: 500 }
      );
    }

    if (!trailer?.id) {
      throw new Error("Baza nije vratila identifikator nove prikolice.");
    }

    try {
      await syncTrailerCategories(trailer.id, categoryIds);
    } catch (categoryError) {
      await supabaseAdmin.from("povuci_trailers").delete().eq("id", trailer.id);
      throw categoryError;
    }

    revalidateCatalogPages();

    return NextResponse.json({
      success: true,
      message: `Prikolica "${title}" je uspešno dodata u bazu!`,
      trailerId: trailer.id,
    });
  } catch (err: unknown) {
    console.error("API Create Trailer Error:", err);
    const msg = err instanceof Error ? err.message : "Greška pri dodavanju prikolice.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
