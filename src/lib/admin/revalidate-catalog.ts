import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateCatalogPages(): void {
  revalidatePath("/");
  revalidatePath("/vesta");
  revalidatePath("/trigano");
  revalidatePath("/prikolice");
  revalidatePath("/prikolice/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/prikolice");
}
