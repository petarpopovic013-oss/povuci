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
