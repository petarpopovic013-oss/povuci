import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { optimizeImageToWebp } from "@/lib/images/optimize";
import { revalidateCatalogPages } from "@/lib/admin/revalidate-catalog";
import {
  parseTrailerCategoryIds,
  syncTrailerCategories,
} from "@/lib/admin/trailer-categories";

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
    const axlesCount = parseInt((formData.get("axles_count") as string) || "1", 10);
    const hasTilt = formData.get("has_tilt") === "on";
    const hasSupportWheel = formData.get("has_support_wheel") === "on";
    const hasWinch = formData.get("has_winch") === "on";
    const hasRamps = formData.get("has_ramps") === "on";
    const isFeatured = formData.get("is_featured") === "on";

    const grossWeightKg = formData.get("gross_weight_kg")
      ? parseFloat(formData.get("gross_weight_kg") as string)
      : null;
    const curbWeightKg = formData.get("curb_weight_kg")
      ? parseFloat(formData.get("curb_weight_kg") as string)
      : null;
    const payloadCapacityKg = formData.get("payload_capacity_kg")
      ? parseFloat(formData.get("payload_capacity_kg") as string)
      : null;
    const realPayloadCapacityKg = formData.get("real_payload_capacity_kg")
      ? parseFloat(formData.get("real_payload_capacity_kg") as string)
      : null;

    const internalLengthMm = formData.get("internal_length_mm")
      ? parseFloat(formData.get("internal_length_mm") as string)
      : null;
    const internalWidthMm = formData.get("internal_width_mm")
      ? parseFloat(formData.get("internal_width_mm") as string)
      : null;
    const internalHeightMm = formData.get("internal_height_mm")
      ? parseFloat(formData.get("internal_height_mm") as string)
      : null;
    const loadingHeightMm = formData.get("loading_height_mm")
      ? parseFloat(formData.get("loading_height_mm") as string)
      : null;

    const suspension = (formData.get("suspension") as string) || null;
    const wheelSpecs = (formData.get("wheel_specs") as string) || null;
    const chassis = (formData.get("chassis") as string) || null;
    const floorType = (formData.get("floor_type") as string) || null;
    const sideMaterial = (formData.get("side_material") as string) || null;
    const sidesOpening = (formData.get("sides_opening") as string) || null;

    const description = (formData.get("description") as string) || null;

    const slugBase = `${brand}-${model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    // Handle Image Uploads & Optimization (WebP compression via Sharp)
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImages: {
      image_url: string;
      storage_path: string;
      is_main: boolean;
      sort_order: number;
    }[] = [];

    const BUCKET_NAME = "povuci-trailer-images";

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

          const storagePath = `${brand.toLowerCase()}/${slug}/${Date.now()}-${i + 1}.webp`;

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
              is_main: i === 0,
              sort_order: i,
            });
          } else {
            console.error("Storage upload error:", uploadErr);
          }
        } catch (err) {
          console.error("Optimization error:", err);
        }
      }
    }

    const mainImageUrl = uploadedImages.length > 0 ? uploadedImages[0].image_url : null;

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
        has_support_wheel: hasSupportWheel,
        has_winch: hasWinch,
        has_ramps: hasRamps,
        is_featured: isFeatured,
        gross_weight_kg: grossWeightKg,
        curb_weight_kg: curbWeightKg,
        payload_capacity_kg: payloadCapacityKg,
        real_payload_capacity_kg: realPayloadCapacityKg,
        internal_length_mm: internalLengthMm,
        internal_width_mm: internalWidthMm,
        internal_height_mm: internalHeightMm,
        loading_height_mm: loadingHeightMm,
        suspension,
        wheel_specs: wheelSpecs,
        chassis,
        floor_type: floorType,
        side_material: sideMaterial,
        sides_opening: sidesOpening,
        description,
        main_image_url: mainImageUrl,
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

    if (trailer?.id) {
      await syncTrailerCategories(trailer.id, categoryIds);
    }

    if (uploadedImages.length > 0 && trailer?.id) {
      const imagesToInsert = uploadedImages.map((img) => ({
        trailer_id: trailer.id,
        image_url: img.image_url,
        storage_path: img.storage_path,
        is_main: img.is_main,
        sort_order: img.sort_order,
      }));

      await supabaseAdmin.from("povuci_trailer_images").insert(imagesToInsert);
    }

    revalidateCatalogPages();

    return NextResponse.json({
      success: true,
      message: `Prikolica "${title}" je uspešno dodata u bazu!`,
      trailerId: trailer?.id,
    });
  } catch (err: unknown) {
    console.error("API Create Trailer Error:", err);
    const msg = err instanceof Error ? err.message : "Greška pri dodavanju prikolice.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
