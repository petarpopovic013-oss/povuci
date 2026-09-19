import { cache } from "react";
import { ALL_TRAILERS, CatalogTrailer } from "../data/trailers";
import { supabaseAdmin } from "./supabase/admin";
import type { PovuciTrailer, PovuciTrailerImage } from "../types/trailer";
import { parseOptionsFromDescription } from "./trailer-utils";
import { getDefaultFilterCategoryIds } from "./trailer-filter-categories";

function mapCatalogToPovuciTrailer(cat: CatalogTrailer): PovuciTrailer {
  const images: PovuciTrailerImage[] = [];

  if (cat.mainImageUrl) {
    images.push({
      id: "img-1",
      trailer_id: cat.id,
      image_url: cat.mainImageUrl,
      storage_path: null,
      is_main: true,
      sort_order: 0,
      alt_text: cat.title,
      created_at: new Date().toISOString(),
    });
  }

  const desc = cat.description || null;
  const parsedOptions = parseOptionsFromDescription(desc);

  return {
    id: cat.id,
    brand: cat.brand,
    category_id: cat.categoryId,
    filter_categories: getDefaultFilterCategoryIds(cat).map((category_id) => ({
      category_id,
    })),
    category: {
      id: cat.categoryId,
      name: cat.categoryName,
      slug: cat.categoryId,
      description: null,
      icon: null,
      sort_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    model: cat.model,
    slug: cat.slug,
    title: cat.title,
    subtitle: `${cat.brand} prikolica vrhunskog kvaliteta sa garancijom od 24 meseca`,
    sku: null,
    kp_ad_id: null,
    source_url: null,
    status: "available",
    is_featured: false,
    is_b_category: cat.isBCategory,
    is_braked: cat.isBraked,
    axles_count: cat.axlesCount,
    has_tilt: cat.hasTilt,
    has_support_wheel: true,
    has_winch:
      cat.title.toLowerCase().includes("marine") ||
      cat.title.toLowerCase().includes("šlep") ||
      cat.title.toLowerCase().includes("slep"),
    has_ramps:
      cat.title.toLowerCase().includes("šlep") ||
      cat.title.toLowerCase().includes("slep") ||
      cat.title.toLowerCase().includes("transporter"),
    price_rsd: cat.priceRsd,
    price_eur: Math.round(cat.priceRsd / 117.2),
    old_price_rsd: null,
    vat_included: true,
    warranty_months: 24,
    gross_weight_kg: cat.grossWeightKg,
    curb_weight_kg: cat.curbWeightKg,
    payload_capacity_kg: cat.payloadCapacityKg,
    real_payload_capacity_kg: null,
    internal_length_mm: null,
    internal_width_mm: null,
    internal_height_mm: null,
    loading_height_mm: null,
    external_length_mm: null,
    external_width_mm: null,
    external_height_mm: null,
    boat_length_max_m: null,
    suspension:
      cat.axlesCount > 1
        ? "Dve torzione osovine (Knott / AL-KO)"
        : "Torziona osovina (Knott / AL-KO)",
    wheel_specs: "155/80 R13 ili 165/70 R13",
    chassis: "Toplocinkovani čelični ram visoke čvrstoće",
    floor_type: "Vodootporni neklizajući šper",
    side_material: "Pocinkovani profilni lim / šper",
    sides_opening: "Prednja i zadnja stranica se otvaraju i skidaju",
    tie_down_points: 4,
    main_image_url: cat.mainImageUrl || null,
    description: desc,
    homologation_info: "Izdaje se kompletan COC i homologacija za registraciju",
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images,
    options: parsedOptions,
  };
}

type DatabaseCatalogTrailer = {
  id: string;
  brand: "Vesta" | "Trigano";
  model: string;
  slug: string;
  title: string;
  category_id: string | null;
  price_rsd: number | null;
  gross_weight_kg: number | null;
  curb_weight_kg: number | null;
  payload_capacity_kg: number | null;
  axles_count: number | null;
  is_b_category: boolean | null;
  is_braked: boolean | null;
  internal_length_mm: number | null;
  internal_width_mm: number | null;
  internal_height_mm: number | null;
  has_tilt: boolean | null;
  main_image_url: string | null;
  description: string | null;
  filter_categories?: { category_id: string }[] | null;
};

export const getCatalogTrailers = cache(async (): Promise<CatalogTrailer[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("povuci_trailers")
      .select(`
        id, brand, model, slug, title, category_id, price_rsd,
        gross_weight_kg, curb_weight_kg, payload_capacity_kg,
        axles_count, is_b_category, is_braked, internal_length_mm,
        internal_width_mm, internal_height_mm, has_tilt, main_image_url,
        description, filter_categories:povuci_trailer_categories(category_id)
      `)
      .eq("status", "available")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) throw error;

    if (data) {
      return (data as DatabaseCatalogTrailer[]).map((trailer) => {
        const categoryIds = (trailer.filter_categories || []).map(
          (category) => category.category_id
        );
        const fallbackCategoryId = trailer.category_id || "ostalo";
        const dimensions =
          trailer.internal_length_mm && trailer.internal_width_mm
            ? [
                trailer.internal_length_mm,
                trailer.internal_width_mm,
                trailer.internal_height_mm,
              ]
                .filter((value): value is number => value != null)
                .join("x") + " mm"
            : null;

        return {
          id: trailer.id,
          brand: trailer.brand,
          model: trailer.model,
          slug: trailer.slug,
          title: trailer.title,
          categoryId: fallbackCategoryId,
          categoryName: fallbackCategoryId,
          categoryIds,
          priceRsd: trailer.price_rsd || 0,
          grossWeightKg: trailer.gross_weight_kg || 0,
          curbWeightKg: trailer.curb_weight_kg,
          payloadCapacityKg: trailer.payload_capacity_kg,
          axlesCount: trailer.axles_count || 1,
          isBCategory: Boolean(trailer.is_b_category),
          isBraked: Boolean(trailer.is_braked),
          dimensions,
          hasTilt: Boolean(trailer.has_tilt),
          mainImageUrl: trailer.main_image_url,
          description: trailer.description,
        };
      });
    }
  } catch (error) {
    console.warn("Supabase catalog fetch error, using static catalog:", error);
  }

  return ALL_TRAILERS.map((trailer) => ({
    ...trailer,
    categoryIds: getDefaultFilterCategoryIds(trailer),
  }));
});

export async function getAllTrailerSlugs(): Promise<string[]> {
  const slugsSet = new Set<string>();
  try {
    const { data, error } = await supabaseAdmin
      .from("povuci_trailers")
      .select("slug, status");

    if (error) throw error;

    const databaseSlugs = new Set(
      (data || []).map((row) => row.slug).filter((slug): slug is string => Boolean(slug))
    );

    for (const row of data || []) {
      if (row.slug && row.status === "available") slugsSet.add(row.slug);
    }

    for (const trailer of ALL_TRAILERS) {
      if (trailer.slug && !databaseSlugs.has(trailer.slug)) {
        slugsSet.add(trailer.slug);
      }
    }
  } catch (err) {
    console.warn("Error fetching slugs from Supabase:", err);
    for (const trailer of ALL_TRAILERS) {
      if (trailer.slug) slugsSet.add(trailer.slug);
    }
  }

  return Array.from(slugsSet);
}

export const getTrailerBySlug = cache(async (slug: string): Promise<PovuciTrailer | null> => {
  // Try fetching complete object from Supabase first
  try {
    const { data: trailer, error } = await supabaseAdmin
      .from("povuci_trailers")
      .select(`
        *,
        images:povuci_trailer_images(*),
        options:povuci_trailer_options(*),
        category:povuci_categories(*),
        filter_categories:povuci_trailer_categories(category_id)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && trailer) {
      if (trailer.status !== "available") return null;

      // If DB has trailer, sort images
      const images: PovuciTrailerImage[] = (trailer.images || []).sort(
        (a: PovuciTrailerImage, b: PovuciTrailerImage) => a.sort_order - b.sort_order
      );

      // If DB options are empty, parse from description
      let options = trailer.options || [];
      if (!options || options.length === 0) {
        options = parseOptionsFromDescription(trailer.description);
      }

      return {
        ...trailer,
        images,
        options,
      };
    }
  } catch (err) {
    console.warn("Supabase fetch trailer by slug error:", err);
  }

  // Fallback to static data
  const staticTrailer = ALL_TRAILERS.find((t) => t.slug === slug);
  if (!staticTrailer) {
    // Try matching by model name
    const matchByModel = ALL_TRAILERS.find(
      (t) =>
        t.model.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase()
    );
    if (!matchByModel) return null;
    return mapCatalogToPovuciTrailer(matchByModel);
  }

  return mapCatalogToPovuciTrailer(staticTrailer);
});

export async function getRelatedTrailers(
  currentTrailer: PovuciTrailer,
  limit: number = 3
): Promise<CatalogTrailer[]> {
  const sameCategory = ALL_TRAILERS.filter(
    (t) =>
      t.slug !== currentTrailer.slug &&
      t.categoryId === currentTrailer.category_id
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const sameBrand = ALL_TRAILERS.filter(
    (t) =>
      t.slug !== currentTrailer.slug &&
      t.brand === currentTrailer.brand &&
      !sameCategory.some((sc) => sc.slug === t.slug)
  );

  const combined = [...sameCategory, ...sameBrand];
  if (combined.length < limit) {
    const others = ALL_TRAILERS.filter(
      (t) =>
        t.slug !== currentTrailer.slug && !combined.some((c) => c.slug === t.slug)
    );
    combined.push(...others);
  }

  return combined.slice(0, limit);
}
