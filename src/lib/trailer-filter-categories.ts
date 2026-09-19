import type { CatalogTrailer } from "@/data/trailers";

export const TRAILER_FILTER_CATEGORIES = [
  { id: "lake-teretne", name: "Lake auto prikolice do 750 kg" },
  { id: "cargo-teske", name: "Cargo i teški teret" },
  { id: "nautika-camci", name: "Nautika i čamci" },
  { id: "kiper", name: "Kiper (hidraulika)" },
  { id: "moto-atv", name: "Moto i ATV / UTV / Quad / Buggy" },
  { id: "plato-slep", name: "Plato i šlep prikolice" },
] as const;

export type TrailerFilterCategoryId =
  (typeof TRAILER_FILTER_CATEGORIES)[number]["id"];

const LIGHT_TRAILER_SLUGS = new Set([
  "trigano-p150",
  "trigano-p170",
  "trigano-p202",
  "trigano-p205",
  "trigano-p233",
  "trigano-2p233",
  "trigano-p265",
  "trigano-tp-2p265",
  "trigano-c200",
  "trigano-tp-40393-c250",
  "trigano-2c250",
  "trigano-d200",
  "trigano-d250",
  "trigano-2d250",
  "trigano-tp39550",
  "vesta-uno-20",
  "vesta-light-15",
  "vesta-light-17",
  "vesta-light-20",
  "vesta-light-20w",
  "vesta-light-23",
  "vesta-light-23-da",
  "vesta-light-23-wda",
  "vesta-light-25",
  "vesta-light-25-da",
  "vesta-light-26-h",
  "vesta-light-26-hda",
  "vesta-light-30",
  "vesta-light-30-da",
  "vesta-light-30-hda",
]);

const CARGO_EXTRA_SLUGS = new Set([
  "trigano-2c300",
  "trigano-tp39600-kiper",
  "trigano-2s250",
]);

const HYDRAULIC_TIPPER_SLUGS = new Set([
  "trigano-tp39600-kiper",
  "trigano-tp39560-kiper",
  "trigano-tp34352-kiper",
]);

const MOTO_ATV_SLUGS = new Set([
  "vesta-moto-750-3",
  "trigano-p304",
  "vesta-plato-3015",
  "vesta-plato-3017",
  "vesta-plato-2513",
  "vesta-plato-3117-2-0-2t",
  "vesta-plato-2617",
  "trigano-39750",
]);

export function getDefaultFilterCategoryIds(
  trailer: Pick<CatalogTrailer, "slug" | "model" | "categoryId">
): TrailerFilterCategoryId[] {
  const ids: TrailerFilterCategoryId[] = [];
  const model = trailer.model.toLocaleLowerCase("sr-Latn");

  if (LIGHT_TRAILER_SLUGS.has(trailer.slug)) ids.push("lake-teretne");

  if (
    model.startsWith("cargo ") ||
    model.startsWith("craft ") ||
    CARGO_EXTRA_SLUGS.has(trailer.slug)
  ) {
    ids.push("cargo-teske");
  }

  if (trailer.categoryId === "nautika-camci") ids.push("nautika-camci");
  if (HYDRAULIC_TIPPER_SLUGS.has(trailer.slug)) ids.push("kiper");
  if (MOTO_ATV_SLUGS.has(trailer.slug)) ids.push("moto-atv");

  if (
    model.includes("plato") ||
    model.includes("šlep") ||
    model.includes("slep")
  ) {
    ids.push("plato-slep");
  }

  return ids;
}

export function getTrailerFilterCategoryIds(
  trailer: Pick<CatalogTrailer, "slug" | "model" | "categoryId" | "categoryIds">
): TrailerFilterCategoryId[] {
  if (trailer.categoryIds?.length) {
    return trailer.categoryIds.filter((id): id is TrailerFilterCategoryId =>
      TRAILER_FILTER_CATEGORIES.some((category) => category.id === id)
    );
  }

  return getDefaultFilterCategoryIds(trailer);
}

export function getFilterCategoryName(categoryId: string): string {
  return (
    TRAILER_FILTER_CATEGORIES.find((category) => category.id === categoryId)?.name ??
    categoryId
  );
}
