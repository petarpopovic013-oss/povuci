import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  TRAILER_FILTER_CATEGORIES,
  type TrailerFilterCategoryId,
} from "@/lib/trailer-filter-categories";

const allowedCategoryIds = new Set<string>(
  TRAILER_FILTER_CATEGORIES.map((category) => category.id)
);

export function parseTrailerCategoryIds(
  formData: FormData
): TrailerFilterCategoryId[] {
  return Array.from(
    new Set(
      formData
        .getAll("category_ids")
        .filter((value): value is string => typeof value === "string")
        .filter((value) => allowedCategoryIds.has(value))
    )
  ) as TrailerFilterCategoryId[];
}

export async function syncTrailerCategories(
  trailerId: string,
  categoryIds: TrailerFilterCategoryId[]
): Promise<void> {
  const { error: deleteError } = await supabaseAdmin
    .from("povuci_trailer_categories")
    .delete()
    .eq("trailer_id", trailerId);

  if (deleteError) throw new Error(deleteError.message);
  if (categoryIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin
    .from("povuci_trailer_categories")
    .insert(
      categoryIds.map((categoryId) => ({
        trailer_id: trailerId,
        category_id: categoryId,
      }))
    );

  if (insertError) throw new Error(insertError.message);
}
