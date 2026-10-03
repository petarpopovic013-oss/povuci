import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { optimizeImageToWebp } from "@/lib/images/optimize";
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
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Nedostaje identifikator prikolice." },
        { status: 400 }
      );
    }

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

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );

    // Handle Image Uploads
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImages: {
      image_url: string;
      storage_path: string;
      is_main: boolean;
      sort_order: number;
    }[] = [];
    const BUCKET_NAME = "povuci-trailer-images";

    let startingSortOrder = 0;
    if (isUuid) {
      try {
        const { data: existingImages } = await supabaseAdmin
          .from("povuci_trailer_images")
          .select("id, sort_order")
          .eq("trailer_id", id);
        startingSortOrder = existingImages?.length || 0;
      } catch (e) {
        console.warn("Could not read existing images sort order:", e);
      }
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const { buffer: webpBuffer, contentType } = await optimizeImageToWebp(
            arrayBuffer,
            {
              maxWidth: 1920,
              maxHeight: 1440,
              quality: 80,
            }
          );

          const safeId = isUuid ? id : (id.includes("-") ? id : "trailer");
          const storagePath = `${brand.toLowerCase()}/${safeId}/${Date.now()}-${i + 1}.webp`;

          const { error: uploadErr } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(storagePath, webpBuffer, {
              contentType,
              upsert: true,
            });

          if (!uploadErr) {
            const { data: pubData } = supabaseAdmin.storage
              .from(BUCKET_NAME)
              .getPublicUrl(storagePath);

            uploadedImages.push({
              image_url: pubData.publicUrl,
              storage_path: storagePath,
              is_main: startingSortOrder === 0 && i === 0,
              sort_order: startingSortOrder + i,
            });
          } else {
            console.error("Storage upload error:", uploadErr);
          }
        } catch (err) {
          console.error("Image optimization error:", err);
        }
      }
    }

    const payload: Record<string, unknown> = {
      brand,
      model,
      title,
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
      updated_at: new Date().toISOString(),
    };

    if (uploadedImages.length > 0 && startingSortOrder === 0) {
      payload.main_image_url = uploadedImages[0].image_url;
    }

    let targetTrailerId = id;

    if (isUuid) {
      const { data: existing } = await supabaseAdmin
        .from("povuci_trailers")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (existing) {
        const { error: updateErr } = await supabaseAdmin
          .from("povuci_trailers")
          .update(payload)
          .eq("id", id);
        if (updateErr) throw new Error(updateErr.message);
      } else {
        const slugBase = `${brand}-${model}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        payload.slug = slugBase;
        payload.id = id;
        const { data: inserted, error: insErr } = await supabaseAdmin
          .from("povuci_trailers")
          .insert(payload)
          .select()
          .single();
        if (insErr) throw new Error(insErr.message);
        if (inserted) targetTrailerId = inserted.id;
      }
    } else {
      const slugBase = id.includes("-")
        ? id
        : `${brand}-${model}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
      payload.slug = slugBase;

      const { data: existingBySlug } = await supabaseAdmin
        .from("povuci_trailers")
        .select("id")
        .eq("slug", slugBase)
        .maybeSingle();

      if (existingBySlug) {
        const { error: updateErr } = await supabaseAdmin
          .from("povuci_trailers")
          .update(payload)
          .eq("id", existingBySlug.id);
        if (updateErr) throw new Error(updateErr.message);
        targetTrailerId = existingBySlug.id;
      } else {
        const { data: inserted, error: insErr } = await supabaseAdmin
          .from("povuci_trailers")
          .insert(payload)
          .select()
          .single();
        if (insErr) throw new Error(insErr.message);
        if (inserted) targetTrailerId = inserted.id;
      }
    }

    // Insert new images if any and we have a valid target trailer UUID
    if (
      uploadedImages.length > 0 &&
      targetTrailerId &&
      /^[0-9a-f-]{36}$/i.test(targetTrailerId)
    ) {
      const imagesToInsert = uploadedImages.map((img) => ({
        trailer_id: targetTrailerId,
        image_url: img.image_url,
        storage_path: img.storage_path,
        is_main: img.is_main,
        sort_order: img.sort_order,
      }));

      await supabaseAdmin.from("povuci_trailer_images").insert(imagesToInsert);
    }

    await syncTrailerCategories(targetTrailerId, categoryIds);

    revalidateCatalogPages();

    return NextResponse.json({
      success: true,
      message: `Izmene na modelu "${title}" su uspešno sačuvane!`,
      trailerId: targetTrailerId,
    });
  } catch (err: unknown) {
    console.error("API Update Trailer Error:", err);
    const msg = err instanceof Error ? err.message : "Greška pri obradi zahteva.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
