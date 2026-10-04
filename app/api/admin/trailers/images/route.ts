import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateCatalogPages } from "@/lib/admin/revalidate-catalog";
import { hasAdminSession } from "@/lib/admin/session";
import { optimizeImageToWebp } from "@/lib/images/optimize";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "povuci-trailer-images";
const MAX_IMAGE_BYTES = 4_000_000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  let uploadedStoragePath: string | null = null;

  try {
    if (!(await hasAdminSession())) {
      return NextResponse.json(
        { success: false, error: "Niste prijavljeni." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const trailerId = formData.get("trailerId");
    const image = formData.get("image");

    if (typeof trailerId !== "string" || !UUID_PATTERN.test(trailerId)) {
      return NextResponse.json(
        { success: false, error: "Neispravan identifikator prikolice." },
        { status: 400 }
      );
    }

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { success: false, error: "Fotografija nije poslata." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Izabrani fajl nije fotografija." },
        { status: 400 }
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Fotografija je prevelika. Maksimalna veličina nakon optimizacije je 4 MB.",
        },
        { status: 413 }
      );
    }

    const { data: trailer, error: trailerError } = await supabaseAdmin
      .from("povuci_trailers")
      .select("id, brand, slug, main_image_url")
      .eq("id", trailerId)
      .maybeSingle();

    if (trailerError) throw new Error(trailerError.message);
    if (!trailer) {
      return NextResponse.json(
        { success: false, error: "Prikolica nije pronađena." },
        { status: 404 }
      );
    }

    const { data: existingImages, error: imagesError } = await supabaseAdmin
      .from("povuci_trailer_images")
      .select("sort_order")
      .eq("trailer_id", trailerId);

    if (imagesError) throw new Error(imagesError.message);

    const sortOrder = (existingImages || []).reduce(
      (highest, existing) => Math.max(highest, existing.sort_order ?? -1),
      -1
    ) + 1;
    const isMain = !trailer.main_image_url && sortOrder === 0;
    const safeBrand = String(trailer.brand || "prikolice")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "prikolice";
    const { buffer, contentType } = await optimizeImageToWebp(
      await image.arrayBuffer(),
      { maxWidth: 1920, maxHeight: 1440, quality: 80 }
    );
    const storagePath = `${safeBrand}/${trailer.slug}/${Date.now()}-${randomUUID()}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (uploadError) throw new Error(uploadError.message);
    uploadedStoragePath = storagePath;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const { data: insertedImage, error: insertError } = await supabaseAdmin
      .from("povuci_trailer_images")
      .insert({
        trailer_id: trailerId,
        image_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        is_main: isMain,
        sort_order: sortOrder,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);

    if (isMain) {
      const { error: mainImageError } = await supabaseAdmin
        .from("povuci_trailers")
        .update({
          main_image_url: publicUrlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", trailerId);

      if (mainImageError) {
        await supabaseAdmin
          .from("povuci_trailer_images")
          .delete()
          .eq("id", insertedImage.id);
        throw new Error(mainImageError.message);
      }
    }

    uploadedStoragePath = null;
    revalidateCatalogPages();

    return NextResponse.json({
      success: true,
      message: "Fotografija je uspešno dodata.",
    });
  } catch (error: unknown) {
    if (uploadedStoragePath) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([uploadedStoragePath]);
    }

    console.error("API Upload Trailer Image Error:", error);
    const message =
      error instanceof Error ? error.message : "Fotografija nije mogla biti sačuvana.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
