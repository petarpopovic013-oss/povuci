import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { optimizeImageToWebp } from "@/lib/images/optimize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

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
    const categoryId = (formData.get("category_id") as string) || null;
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

    revalidatePath("/");
    revalidatePath("/vesta");
    revalidatePath("/trigano");
    revalidatePath("/prikolice");
    revalidatePath("/admin");
    revalidatePath("/admin/prikolice");

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
