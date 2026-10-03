import { cache } from "react";
import { ALL_TRAILERS, CatalogTrailer } from "../data/trailers";
import { supabaseAdmin } from "./supabase/admin";
import type { PovuciTrailer, PovuciTrailerImage } from "../types/trailer";
import { parseOptionsFromDescription } from "./trailer-utils";
import { getDefaultFilterCategoryIds } from "./trailer-filter-categories";
import {
  cleanTrailerDescription,
  deriveTrailerCharacteristics,
} from "./trailer-characteristics";

function parseSimpleDimensions(value: string | null): Array<number | null> {
  if (!value || value.includes("–")) return [null, null, null];
  const values = value
    .replace(/ mm$/, "")
    .split(" × ")
    .map((part) => Number(part));
  return [0, 1, 2].map((index) =>
    Number.isFinite(values[index]) ? values[index] : null
  );
}

function enrichStaticCatalogTrailer(cat: CatalogTrailer): CatalogTrailer {
  const characteristics = deriveTrailerCharacteristics({
    slug: cat.slug,
    description: cat.description,
    fallbackGrossWeightKg: cat.grossWeightKg,
    fallbackCurbWeightKg: cat.curbWeightKg,
  });

  return {
    ...cat,
    description: cleanTrailerDescription(cat.slug, cat.description),
    grossWeightKg: characteristics.grossWeightKg,
    curbWeightKg: characteristics.curbWeightKg,
    axlesCount: characteristics.axlesCount,
    hasTilt: characteristics.tiltType !== null,
    cargoSpaceDimensions: characteristics.cargoSpaceDimensions,
    externalDimensions: characteristics.externalDimensions,
    tiltType: characteristics.tiltType,
    wheelSpecs: characteristics.wheelSpecs,
    floorType: characteristics.floorType,
    chassis: characteristics.chassis,
    warrantyMonths: characteristics.warrantyMonths,
    dimensions: characteristics.cargoSpaceDimensions,
  };
}

function mapCatalogToPovuciTrailer(cat: CatalogTrailer): PovuciTrailer {
  const enriched = enrichStaticCatalogTrailer(cat);
  const images: PovuciTrailerImage[] = [];

  if (enriched.mainImageUrl) {
    images.push({
      id: "img-1",
      trailer_id: enriched.id,
      image_url: enriched.mainImageUrl,
      storage_path: null,
      is_main: true,
      sort_order: 0,
      alt_text: enriched.title,
      created_at: new Date().toISOString(),
    });
  }

  const desc = enriched.description || null;
  const parsedOptions = parseOptionsFromDescription(desc);
  const [internalLength, internalWidth, internalHeight] = parseSimpleDimensions(
    enriched.cargoSpaceDimensions || null
  );
  const [externalLength, externalWidth, externalHeight] = parseSimpleDimensions(
    enriched.externalDimensions || null
  );

  return {
    id: enriched.id,
    brand: enriched.brand,
    category_id: enriched.categoryId,
    filter_categories: getDefaultFilterCategoryIds(enriched).map((category_id) => ({
      category_id,
    })),
    category: {
      id: enriched.categoryId,
      name: enriched.categoryName,
      slug: enriched.categoryId,
      description: null,
      icon: null,
      sort_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    model: enriched.model,
    slug: enriched.slug,
    title: enriched.title,
    subtitle: `${enriched.brand} prikolica vrhunskog kvaliteta`,
    sku: null,
    kp_ad_id: null,
    source_url: null,
    status: "available",
    is_featured: false,
    is_b_category: enriched.isBCategory,
    is_braked: enriched.isBraked,
    axles_count: enriched.axlesCount,
    has_tilt: enriched.hasTilt,
    tilt_type: enriched.tiltType || null,
    has_support_wheel: true,
    has_winch:
      enriched.title.toLowerCase().includes("marine") ||
      enriched.title.toLowerCase().includes("šlep") ||
      enriched.title.toLowerCase().includes("slep"),
    has_ramps:
      enriched.title.toLowerCase().includes("šlep") ||
      enriched.title.toLowerCase().includes("slep") ||
      enriched.title.toLowerCase().includes("transporter"),
    price_rsd: enriched.priceRsd,
    price_eur: Math.round(enriched.priceRsd / 117.2),
    old_price_rsd: null,
    vat_included: true,
    warranty_months: enriched.warrantyMonths || null,
    gross_weight_kg: enriched.grossWeightKg,
    curb_weight_kg: enriched.curbWeightKg,
    payload_capacity_kg: enriched.payloadCapacityKg,
    real_payload_capacity_kg: null,
    internal_length_mm: internalLength,
    internal_width_mm: internalWidth,
    internal_height_mm: internalHeight,
    loading_height_mm: null,
    cargo_space_dimensions: enriched.cargoSpaceDimensions || null,
    external_length_mm: externalLength,
    external_width_mm: externalWidth,
    external_height_mm: externalHeight,
    external_dimensions: enriched.externalDimensions || null,
    boat_length_max_m: null,
    suspension:
      enriched.axlesCount != null && enriched.axlesCount > 1
        ? "Dve torzione osovine (Knott / AL-KO)"
        : enriched.axlesCount === 1
          ? "Torziona osovina (Knott / AL-KO)"
          : null,
    wheel_specs: enriched.wheelSpecs || null,
    chassis: enriched.chassis || null,
    floor_type: enriched.floorType || null,
    side_material: "Pocinkovani profilni lim / šper",
    sides_opening: "Prednja i zadnja stranica se otvaraju i skidaju",
    tie_down_points: 4,
    main_image_url: enriched.mainImageUrl || null,
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
  cargo_space_dimensions: string | null;
  external_dimensions: string | null;
  has_tilt: boolean | null;
  tilt_type: "mechanical" | "hydraulic" | null;
  wheel_specs: string | null;
  floor_type: string | null;
  chassis: string | null;
  warranty_months: number | null;
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
        internal_width_mm, internal_height_mm, cargo_space_dimensions,
        external_dimensions, has_tilt, tilt_type, wheel_specs, floor_type,
        chassis, warranty_months, main_image_url,
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
          grossWeightKg: trailer.gross_weight_kg,
          curbWeightKg: trailer.curb_weight_kg,
          payloadCapacityKg: trailer.payload_capacity_kg,
          axlesCount: trailer.axles_count,
          isBCategory: Boolean(trailer.is_b_category),
          isBraked: Boolean(trailer.is_braked),
          dimensions: trailer.cargo_space_dimensions,
          hasTilt: Boolean(trailer.has_tilt),
          cargoSpaceDimensions: trailer.cargo_space_dimensions,
          externalDimensions: trailer.external_dimensions,
          tiltType: trailer.tilt_type,
          wheelSpecs: trailer.wheel_specs,
          floorType: trailer.floor_type,
          chassis: trailer.chassis,
          warrantyMonths: trailer.warranty_months,
          mainImageUrl: trailer.main_image_url,
          description: trailer.description,
        };
      });
    }
  } catch (error) {
    console.warn("Supabase catalog fetch error, using static catalog:", error);
  }

  return ALL_TRAILERS.map((trailer) => {
    const enriched = enrichStaticCatalogTrailer(trailer);
    return {
      ...enriched,
      categoryIds: getDefaultFilterCategoryIds(enriched),
    };
  });
});

export async function getAllTrailerSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("povuci_trailers")
      .select("slug, status");

    if (error) throw error;

    return (data || [])
      .filter((row) => row.status === "available")
      .map((row) => row.slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch (err) {
    console.warn("Error fetching slugs from Supabase:", err);
    return ALL_TRAILERS.map((trailer) => trailer.slug).filter(Boolean);
  }
}

export interface SitemapTrailer {
  slug: string;
  updatedAt: string | null;
  imageUrls: string[];
}

export const getSitemapTrailers = cache(async (): Promise<SitemapTrailer[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("povuci_trailers")
      .select(`
        slug, updated_at, main_image_url,
        images:povuci_trailer_images(image_url, sort_order)
      `)
      .eq("status", "available")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) throw error;

    return (data || []).map((trailer) => {
      const relatedImages = [...(trailer.images || [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => image.image_url)
        .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
      const imageUrls = Array.from(
        new Set(
          [trailer.main_image_url, ...relatedImages].filter(
            (imageUrl): imageUrl is string => Boolean(imageUrl)
          )
        )
      );

      return {
        slug: trailer.slug,
        updatedAt: trailer.updated_at,
        imageUrls,
      };
    });
  } catch (error) {
    console.warn("Supabase sitemap fetch error, using static catalog:", error);
    return ALL_TRAILERS.map((trailer) => ({
      slug: trailer.slug,
      updatedAt: null,
      imageUrls: trailer.mainImageUrl ? [trailer.mainImageUrl] : [],
    }));
  }
});

export const getTrailerBySlug = cache(async (slug: string): Promise<PovuciTrailer | null> => {
  // Try fetching complete object from Supabase first
  try {
    const { data: trailer, error } = await supabaseAdmin
      .from("povuci_trailers")
      .select(`
        *,
        images:povuci_trailer_images(*),
        options:povuci_trailer_options(*),
        category:povuci_categories!povuci_trailers_category_id_fkey(*),
        filter_categories:povuci_trailer_categories(category_id)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;

    if (trailer) {
      if (trailer.status !== "available") return null;

      // Keep statically generated pages correct even if Next serves a cached
      // Supabase response created before the characteristic columns existed.
      const derivedCharacteristics = deriveTrailerCharacteristics({
        slug: trailer.slug,
        description: trailer.description,
        fallbackGrossWeightKg: trailer.gross_weight_kg,
        fallbackCurbWeightKg: trailer.curb_weight_kg,
      });
      const tiltType = trailer.tilt_type ?? derivedCharacteristics.tiltType;

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
        description: cleanTrailerDescription(trailer.slug, trailer.description),
        cargo_space_dimensions:
          trailer.cargo_space_dimensions ?? derivedCharacteristics.cargoSpaceDimensions,
        external_dimensions:
          trailer.external_dimensions ?? derivedCharacteristics.externalDimensions,
        gross_weight_kg:
          trailer.gross_weight_kg ?? derivedCharacteristics.grossWeightKg,
        curb_weight_kg:
          trailer.curb_weight_kg ?? derivedCharacteristics.curbWeightKg,
        axles_count: trailer.axles_count ?? derivedCharacteristics.axlesCount,
        tilt_type: tiltType,
        has_tilt: tiltType !== null,
        wheel_specs: trailer.wheel_specs ?? derivedCharacteristics.wheelSpecs,
        floor_type:
          trailer.category_id === "nautika-camci"
            ? null
            : trailer.floor_type ?? derivedCharacteristics.floorType,
        chassis: trailer.chassis ?? derivedCharacteristics.chassis,
        warranty_months:
          trailer.warranty_months ?? derivedCharacteristics.warrantyMonths,
        images,
        options,
      };
    }

    // A successful database lookup with no row means the model no longer exists.
    // Do not revive deleted products from the static emergency fallback.
    return null;
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
  const catalogTrailers = await getCatalogTrailers();
  const sameCategory = catalogTrailers.filter(
    (t) =>
      t.slug !== currentTrailer.slug &&
      t.categoryId === currentTrailer.category_id
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const sameBrand = catalogTrailers.filter(
    (t) =>
      t.slug !== currentTrailer.slug &&
      t.brand === currentTrailer.brand &&
      !sameCategory.some((sc) => sc.slug === t.slug)
  );

  const combined = [...sameCategory, ...sameBrand];
  if (combined.length < limit) {
    const others = catalogTrailers.filter(
      (t) =>
        t.slug !== currentTrailer.slug && !combined.some((c) => c.slug === t.slug)
    );
    combined.push(...others);
  }

  return combined.slice(0, limit);
}
