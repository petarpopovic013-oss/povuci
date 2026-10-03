"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminSession, deleteAdminSession, requireAdmin } from "@/lib/admin/session";
import { revalidateCatalogPages } from "@/lib/admin/revalidate-catalog";
import { supabaseAdmin } from "@/lib/supabase/admin";

function passwordsMatch(received: string, expected: string) {
  const receivedHash = createHash("sha256").update(received).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword && process.env.NODE_ENV === "production") {
    throw new Error("Missing ADMIN_PASSWORD environment variable in production.");
  }

  const effectivePassword = adminPassword || "1234";

  if (!password || !passwordsMatch(password, effectivePassword)) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    redirect("/admin/login?error=Pogrešna+administratorska+šifra");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export async function deleteTrailerAction(id: string) {
  await requireAdmin();

  const { data: images } = await supabaseAdmin
    .from("povuci_trailer_images")
    .select("storage_path")
    .eq("trailer_id", id);

  const paths = (images || [])
    .map((image) => image.storage_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabaseAdmin.storage.from("povuci-trailer-images").remove(paths);
  }

  const { error } = await supabaseAdmin
    .from("povuci_trailers")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(`/admin/prikolice?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCatalogPages();
  redirect("/admin/prikolice?success=Prikolica+uspešno+obrisana");
}

export async function deleteTrailerImageAction(trailerId: string, imageId: string) {
  await requireAdmin();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(trailerId) || !uuidPattern.test(imageId)) {
    return { success: false, error: "Neispravan identifikator fotografije." };
  }

  const [{ data: image, error: imageError }, { data: trailer, error: trailerError }] =
    await Promise.all([
      supabaseAdmin
        .from("povuci_trailer_images")
        .select("id, trailer_id, image_url, storage_path, is_main, sort_order")
        .eq("id", imageId)
        .eq("trailer_id", trailerId)
        .maybeSingle(),
      supabaseAdmin
        .from("povuci_trailers")
        .select("id, main_image_url")
        .eq("id", trailerId)
        .maybeSingle(),
    ]);

  if (imageError || trailerError) {
    return {
      success: false,
      error: imageError?.message || trailerError?.message || "Fotografija nije pronađena.",
    };
  }

  if (!image || !trailer) {
    return { success: false, error: "Fotografija nije pronađena." };
  }

  const { data: allImages, error: allImagesError } = await supabaseAdmin
    .from("povuci_trailer_images")
    .select("id, image_url, is_main, sort_order")
    .eq("trailer_id", trailerId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (allImagesError) {
    return { success: false, error: allImagesError.message };
  }

  const remainingImages = (allImages || []).filter((candidate) => candidate.id !== imageId);
  const wasMainImage = image.is_main || trailer.main_image_url === image.image_url;
  const replacementImage = wasMainImage ? remainingImages[0] || null : null;
  const currentMainImage = wasMainImage
    ? replacementImage
    : remainingImages.find(
        (candidate) => candidate.is_main || candidate.image_url === trailer.main_image_url
      ) || null;

  if (wasMainImage) {
    const { error: trailerUpdateError } = await supabaseAdmin
      .from("povuci_trailers")
      .update({
        main_image_url: replacementImage?.image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trailerId);

    if (trailerUpdateError) {
      return { success: false, error: trailerUpdateError.message };
    }

    if (replacementImage) {
      const { error: replacementError } = await supabaseAdmin
        .from("povuci_trailer_images")
        .update({ is_main: true })
        .eq("id", replacementImage.id)
        .eq("trailer_id", trailerId);

      if (replacementError) {
        await supabaseAdmin
          .from("povuci_trailers")
          .update({ main_image_url: trailer.main_image_url })
          .eq("id", trailerId);
        return { success: false, error: replacementError.message };
      }
    }
  }

  const { error: deleteError } = await supabaseAdmin
    .from("povuci_trailer_images")
    .delete()
    .eq("id", imageId)
    .eq("trailer_id", trailerId);

  if (deleteError) {
    if (replacementImage) {
      await supabaseAdmin
        .from("povuci_trailer_images")
        .update({ is_main: false })
        .eq("id", replacementImage.id)
        .eq("trailer_id", trailerId);
    }
    if (wasMainImage) {
      await supabaseAdmin
        .from("povuci_trailers")
        .update({ main_image_url: trailer.main_image_url })
        .eq("id", trailerId);
    }
    return { success: false, error: deleteError.message };
  }

  let storageWarning: string | null = null;

  if (image.storage_path) {
    const { count, error: referenceError } = await supabaseAdmin
      .from("povuci_trailer_images")
      .select("id", { count: "exact", head: true })
      .eq("storage_path", image.storage_path);

    if (referenceError) {
      storageWarning = "Fotografija je uklonjena iz galerije, ali fajl nije mogao biti proveren.";
    } else if ((count || 0) === 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("povuci-trailer-images")
        .remove([image.storage_path]);

      if (storageError) {
        storageWarning = "Fotografija je uklonjena iz galerije, ali fajl nije obrisan iz Storage-a.";
      }
    }
  }

  revalidateCatalogPages();

  return {
    success: true,
    message: storageWarning || "Fotografija je uspešno obrisana.",
    warning: Boolean(storageWarning),
    mainImageId: currentMainImage?.id || null,
  };
}
