"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSession, deleteAdminSession, requireAdmin } from "@/lib/admin/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { optimizeImageToWebp } from "@/lib/images/optimize";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword && process.env.NODE_ENV === "production") {
    throw new Error("Missing ADMIN_PASSWORD environment variable in production.");
  }

  const effectivePassword = adminPassword || "1234";

  if (!password || password !== effectivePassword) {
    redirect("/admin/login?error=Pogrešna+administratorska+šifra");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export async function createTrailerAction(formData: FormData) {
  await requireAdmin();

  const brand = (formData.get("brand") as string) || "Vesta";
  const model = (formData.get("model") as string) || "";
  const title = (formData.get("title") as string) || `${brand} ${model}`;
  const categoryId = (formData.get("category_id") as string) || null;
  const priceRsd = parseFloat((formData.get("price_rsd") as string) || "0") || 0;
  const priceEur = formData.get("price_eur") ? parseFloat(formData.get("price_eur") as string) : null;
  const oldPriceRsd = formData.get("old_price_rsd") ? parseFloat(formData.get("old_price_rsd") as string) : null;
  const status = (formData.get("status") as string) || "available";

  const isBCategory = formData.get("is_b_category") === "on";
  const isBraked = formData.get("is_braked") === "on";
  const axlesCount = parseInt((formData.get("axles_count") as string) || "1", 10);
  const hasTilt = formData.get("has_tilt") === "on";
  const hasSupportWheel = formData.get("has_support_wheel") === "on";
  const hasWinch = formData.get("has_winch") === "on";
  const hasRamps = formData.get("has_ramps") === "on";
  const isFeatured = formData.get("is_featured") === "on";

  const grossWeightKg = formData.get("gross_weight_kg") ? parseFloat(formData.get("gross_weight_kg") as string) : null;
  const curbWeightKg = formData.get("curb_weight_kg") ? parseFloat(formData.get("curb_weight_kg") as string) : null;
  const payloadCapacityKg = formData.get("payload_capacity_kg") ? parseFloat(formData.get("payload_capacity_kg") as string) : null;
  const realPayloadCapacityKg = formData.get("real_payload_capacity_kg") ? parseFloat(formData.get("real_payload_capacity_kg") as string) : null;

  const internalLengthMm = formData.get("internal_length_mm") ? parseFloat(formData.get("internal_length_mm") as string) : null;
  const internalWidthMm = formData.get("internal_width_mm") ? parseFloat(formData.get("internal_width_mm") as string) : null;
  const internalHeightMm = formData.get("internal_height_mm") ? parseFloat(formData.get("internal_height_mm") as string) : null;
  const loadingHeightMm = formData.get("loading_height_mm") ? parseFloat(formData.get("loading_height_mm") as string) : null;

  const suspension = (formData.get("suspension") as string) || null;
  const wheelSpecs = (formData.get("wheel_specs") as string) || null;
  const chassis = (formData.get("chassis") as string) || null;
  const floorType = (formData.get("floor_type") as string) || null;
  const sideMaterial = (formData.get("side_material") as string) || null;
  const sidesOpening = (formData.get("sides_opening") as string) || null;

  const description = (formData.get("description") as string) || null;

  const slugBase = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

  // Handle Image Uploads & Optimization (WebP compression via Sharp)
  const imageFiles = formData.getAll("images") as File[];
  const uploadedImages: { image_url: string; storage_path: string; is_main: boolean; sort_order: number }[] = [];

  const BUCKET_NAME = "povuci-trailer-images";

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Kompresija i konverzija u WebP
        const { buffer: webpBuffer, contentType } = await optimizeImageToWebp(arrayBuffer, {
          maxWidth: 1920,
          maxHeight: 1440,
          quality: 80,
        });

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
          console.error("Greška pri uploadu optimizovane slike:", uploadErr);
        }
      } catch (err) {
        console.error("Greška pri optimizaciji/obradi slike:", err);
      }
    }
  }

  const mainImageUrl = uploadedImages.length > 0 ? uploadedImages[0].image_url : null;

  const { data: trailer, error } = await supabaseAdmin.from("povuci_trailers").insert({
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
    main_image_url: mainImageUrl,
    description,
  }).select().single();

  if (error) {
    console.error("Greška pri kreiranju prikolice:", error);
    redirect(`/admin/prikolice/nova?error=${encodeURIComponent(error.message)}`);
  }

  // Link uploaded images in povuci_trailer_images table
  if (trailer && uploadedImages.length > 0) {
    const imagesToInsert = uploadedImages.map((img) => ({
      trailer_id: trailer.id,
      image_url: img.image_url,
      storage_path: img.storage_path,
      is_main: img.is_main,
      sort_order: img.sort_order,
    }));

    const { error: imgInsertError } = await supabaseAdmin
      .from("povuci_trailer_images")
      .insert(imagesToInsert);

    if (imgInsertError) {
      console.error("Greška pri linkovanju slika:", imgInsertError);
    }
  }

  revalidatePath("/");
  revalidatePath("/vesta");
  revalidatePath("/trigano");
  revalidatePath("/prikolice");
  revalidatePath("/admin");
  revalidatePath("/admin/prikolice");

  redirect("/admin/prikolice?success=Prikolica+uspešno+dodata");
}

export async function updateTrailerAction(formData: FormData) {
  let trailerId = "";
  try {
    await requireAdmin();

    const id = formData.get("id") as string;
    trailerId = id;
    if (!id) {
      redirect("/admin/prikolice?error=Nedostaje+ID+prikolice");
    }

    const brand = (formData.get("brand") as string) || "Vesta";
    const model = (formData.get("model") as string) || "";
    const title = (formData.get("title") as string) || `${brand} ${model}`;
    const categoryId = (formData.get("category_id") as string) || null;
    const priceRsd = parseFloat((formData.get("price_rsd") as string) || "0") || 0;
    const priceEur = formData.get("price_eur") ? parseFloat(formData.get("price_eur") as string) : null;
    const oldPriceRsd = formData.get("old_price_rsd") ? parseFloat(formData.get("old_price_rsd") as string) : null;
    const status = (formData.get("status") as string) || "available";

    const isBCategory = formData.get("is_b_category") === "on";
    const isBraked = formData.get("is_braked") === "on";
    const axlesCount = parseInt((formData.get("axles_count") as string) || "1", 10);
    const hasTilt = formData.get("has_tilt") === "on";
    const hasSupportWheel = formData.get("has_support_wheel") === "on";
    const hasWinch = formData.get("has_winch") === "on";
    const hasRamps = formData.get("has_ramps") === "on";
    const isFeatured = formData.get("is_featured") === "on";

    const grossWeightKg = formData.get("gross_weight_kg") ? parseFloat(formData.get("gross_weight_kg") as string) : null;
    const curbWeightKg = formData.get("curb_weight_kg") ? parseFloat(formData.get("curb_weight_kg") as string) : null;
    const payloadCapacityKg = formData.get("payload_capacity_kg") ? parseFloat(formData.get("payload_capacity_kg") as string) : null;
    const realPayloadCapacityKg = formData.get("real_payload_capacity_kg") ? parseFloat(formData.get("real_payload_capacity_kg") as string) : null;

    const internalLengthMm = formData.get("internal_length_mm") ? parseFloat(formData.get("internal_length_mm") as string) : null;
    const internalWidthMm = formData.get("internal_width_mm") ? parseFloat(formData.get("internal_width_mm") as string) : null;
    const internalHeightMm = formData.get("internal_height_mm") ? parseFloat(formData.get("internal_height_mm") as string) : null;
    const loadingHeightMm = formData.get("loading_height_mm") ? parseFloat(formData.get("loading_height_mm") as string) : null;

    const suspension = (formData.get("suspension") as string) || null;
    const wheelSpecs = (formData.get("wheel_specs") as string) || null;
    const chassis = (formData.get("chassis") as string) || null;
    const floorType = (formData.get("floor_type") as string) || null;
    const sideMaterial = (formData.get("side_material") as string) || null;
    const sidesOpening = (formData.get("sides_opening") as string) || null;

    const description = (formData.get("description") as string) || null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Handle New Image Uploads if provided
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImages: { image_url: string; storage_path: string; is_main: boolean; sort_order: number }[] = [];
    const BUCKET_NAME = "povuci-trailer-images";

    let startingSortOrder = 0;
    if (isUuid) {
      const { data: existingImages } = await supabaseAdmin
        .from("povuci_trailer_images")
        .select("id, sort_order")
        .eq("trailer_id", id);
      startingSortOrder = existingImages?.length || 0;
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const { buffer: webpBuffer, contentType } = await optimizeImageToWebp(arrayBuffer, {
            maxWidth: 1920,
            maxHeight: 1440,
            quality: 80,
          });

          const storagePath = `${brand.toLowerCase()}/${id}/${Date.now()}-${i + 1}.webp`;

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
          }
        } catch (err) {
          console.error("Greška pri uploadu nove slike:", err);
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
        await supabaseAdmin.from("povuci_trailers").update(payload).eq("id", id);
      } else {
        const slugBase = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        payload.slug = slugBase;
        payload.id = id;
        const { data: inserted } = await supabaseAdmin.from("povuci_trailers").insert(payload).select().single();
        if (inserted) targetTrailerId = inserted.id;
      }
    } else {
      const slugBase = id.includes("-") ? id : `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      payload.slug = slugBase;

      // Check if already in DB by slug
      const { data: existingBySlug } = await supabaseAdmin
        .from("povuci_trailers")
        .select("id")
        .eq("slug", slugBase)
        .maybeSingle();

      if (existingBySlug) {
        await supabaseAdmin.from("povuci_trailers").update(payload).eq("id", existingBySlug.id);
        targetTrailerId = existingBySlug.id;
      } else {
        const { data: inserted } = await supabaseAdmin.from("povuci_trailers").insert(payload).select().single();
        if (inserted) targetTrailerId = inserted.id;
      }
    }

    if (uploadedImages.length > 0 && targetTrailerId && /^[0-9a-f-]{36}$/i.test(targetTrailerId)) {
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
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Greška u updateTrailerAction:", err);
    const msg = err instanceof Error ? err.message : "Greška pri izmeni";
    redirect(`/admin/prikolice/${trailerId || ""}?error=${encodeURIComponent(msg)}`);
  }

  redirect("/admin/prikolice?success=Izmene+uspešno+sačuvane");
}

export async function deleteTrailerAction(id: string) {
  await requireAdmin();

  // Dohvati povezane slike da ih obrišemo i iz Storage-a
  const { data: images } = await supabaseAdmin
    .from("povuci_trailer_images")
    .select("storage_path")
    .eq("trailer_id", id);

  if (images && images.length > 0) {
    const paths = images
      .map((img) => img.storage_path)
      .filter((p): p is string => Boolean(p));

    if (paths.length > 0) {
      await supabaseAdmin.storage.from("povuci-trailer-images").remove(paths);
    }
  }

  const { error } = await supabaseAdmin.from("povuci_trailers").delete().eq("id", id);
  if (error) {
    console.error("Greška pri brisanju:", error);
    redirect(`/admin/prikolice?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/vesta");
  revalidatePath("/trigano");
  revalidatePath("/prikolice");
  revalidatePath("/admin");
  revalidatePath("/admin/prikolice");
  redirect("/admin/prikolice?success=Prikolica+uspešno+obrisana");
}
