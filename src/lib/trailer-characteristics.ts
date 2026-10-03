import type { CatalogTrailer } from "../data/trailers";
import type { PovuciTrailer, TrailerTiltType } from "../types/trailer";

export interface TrailerCharacteristicRow {
  key:
    | "cargo-space"
    | "external-dimensions"
    | "gross-weight"
    | "curb-weight"
    | "axles"
    | "tilt"
    | "wheels"
    | "floor"
    | "chassis"
    | "warranty";
  label: string;
  value: string;
}

export interface NormalizedTrailerCharacteristics {
  cargoSpaceDimensions: string | null;
  externalDimensions: string | null;
  grossWeightKg: number | null;
  curbWeightKg: number | null;
  axlesCount: number | null;
  tiltType: TrailerTiltType | null;
  wheelSpecs: string | null;
  floorType: string | null;
  chassis: string | null;
  warrantyMonths: number | null;
}

const NO_TILT_SLUGS = new Set([
  "trigano-2p233",
  "trigano-2d250",
  "trigano-2c300",
  "trigano-2s250",
  "trigano-p265",
  "trigano-tp-2p265",
]);

const MECHANICAL_TILT_SLUGS = new Set([
  "trigano-2c250",
  "trigano-tp32650-platforma",
]);

const HYDRAULIC_TILT_SLUGS = new Set([
  "trigano-tp34352-kiper",
  "trigano-tp39560-kiper",
  "trigano-tp39600-kiper",
]);

const CARGO_SPACE_OVERRIDES: Record<string, string> = {
  "trigano-39750": "3610 × 1850 × 110 mm",
  "trigano-650-za-skuter": "3700–4450 mm",
  "trigano-p265": "2660 × 1520 × 390 mm",
  "trigano-tp-2p265": "2660 × 1520 × 390 mm",
  "trigano-za-amac-750": "4670–6000 × 1810 mm",
  "trigano-za-amac-sa-rolerima-750": "4670–6000 × 1810 mm",
  "vesta-cargo-30-1-3t": "3003 × 1514 × 370 mm",
  "vesta-cargo-4120-3-5t-14c": "4050 × 2020 × 400 mm",
  "vesta-light-30": "3000 × 1520 × 370 mm",
  "vesta-light-30-da": "3000 × 1520 × 370 mm",
  "vesta-light-30-wda": "3000 × 1520 × 370 mm",
  "vesta-marine-750": "5500 × 1850 mm",
  "vesta-marine-750-sa-skijama": "5500 × 1850 mm",
  "vesta-moto-750-3": "1970–2180 × 1450 mm",
  "vesta-plato-4120-2500kg": "4060 × 2010 mm",
  "vesta-plato-4120-2700kg": "4060 × 2010 mm",
  "vesta-transporter-45g-3-5t": "4500 × 2050 mm",
};

const EXTERNAL_DIMENSIONS_OVERRIDES: Record<string, string> = {
  "trigano-39750": "5400 × 2370 mm",
  "trigano-p170": "2770 × 1680 mm",
  "trigano-p265": "3790 × 2010 mm",
  "trigano-tp-2p265": "3790 × 2010 mm",
  "trigano-za-amac-750": "4300 × 1810 mm",
  "trigano-za-amac-sa-rolerima-750": "4300 × 1810 mm",
  "vesta-cargo-30-1-3t": "4417 × 2030 × 900 mm",
  "vesta-cargo-4120-3-5t-14c": "5425 × 2097 × 1158 mm",
  "vesta-light-30": "4370 × 2030 × 900 mm",
  "vesta-light-30-da": "4370 × 2030 × 900 mm",
  "vesta-light-30-wda": "4370 × 2030 × 900 mm",
  "vesta-plato-3117-2-0-2t": "4462 × 1730 × 1014 mm",
  "vesta-transporter-45g-3-5t": "6190 × 2080 × 1030 mm",
};

function cleanText(value?: string | null): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function capitalize(value?: string | null): string | null {
  const cleaned = cleanText(value);
  return cleaned ? cleaned.charAt(0).toLocaleUpperCase("sr-Latn") + cleaned.slice(1) : null;
}

function matchDescription(
  description: string | null | undefined,
  pattern: RegExp
): string | null {
  return description?.match(pattern)?.[1]?.trim() || null;
}

function normalizeDimensions(value?: string | null): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  return `${cleaned
    .replace(/\s*[xX]\s*/g, " × ")
    .replace(/(\d)-(\d)/g, "$1–$2")
    .replace(/\s*(?:mm|cm)\s*$/i, "")} mm`;
}

function parseMass(value?: string | null): number | null {
  const match = value?.match(/\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeWheels(value?: string | null): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  return cleaned
    .replace(/\/\s+(?=\d)/g, "/")
    .replace(/\/\s+R/gi, " R")
    .replace(/\/R/gi, " R");
}

function resolveAxles(description?: string | null): number | null {
  if (!description) return null;
  const axleLine =
    matchDescription(description, /^(?:Vešanje|Osovine):\s*([^\r\n]+)/im) ||
    matchDescription(description, /^(Troosovinska|Dvoosovinska|Jednoosovinska)[^\r\n]*/im);

  if (!axleLine) return null;
  if (/(troosovinska|tri[^\r\n]*osovine)/i.test(axleLine)) return 3;
  if (/(dvoosovinska|dve[^\r\n]*osovine|x\s*2)/i.test(axleLine)) return 2;
  if (/(jednoosovinska|jedna[^\r\n]*osovina|torziona osovina|nosivost osovine)/i.test(axleLine)) {
    return 1;
  }
  return null;
}

export function resolveTrailerTiltType(
  slug: string,
  description?: string | null
): TrailerTiltType | null {
  if (NO_TILT_SLUGS.has(slug)) return null;
  if (HYDRAULIC_TILT_SLUGS.has(slug)) return "hydraulic";
  if (MECHANICAL_TILT_SLUGS.has(slug)) return "mechanical";
  return /^Prikolica ima mogućnost kipovanja/im.test(description || "")
    ? "mechanical"
    : null;
}

export function cleanTrailerDescription(
  slug: string,
  description?: string | null
): string | null {
  if (!description) return null;
  if (!NO_TILT_SLUGS.has(slug)) return description;
  return description.replace(/^.*kipovanj.*(?:\r?\n)?/gim, "").trim();
}

export function deriveTrailerCharacteristics(args: {
  slug: string;
  description?: string | null;
  fallbackGrossWeightKg?: number | null;
  fallbackCurbWeightKg?: number | null;
}): NormalizedTrailerCharacteristics {
  const description = args.description || "";
  const cargoRaw =
    matchDescription(
      description,
      /^(?:Dimenzije tovarnog prostora(?: \(mm\))?|Unutrašnje dimenzije|Dimenzije platforme|Dimenzije utovarnog prostora|Dimenzije prihvata plovila):\s*([^\r\n]+)/im
    ) ||
    (args.slug === "vesta-plato-2617"
      ? matchDescription(description, /tovarni prostor\s+(\d+\s*x\s*\d+\s*mm)/i)
      : null);
  const externalRaw = matchDescription(
    description,
    /^(?:Gabaritne dimenzije(?: \(mm\))?|Spoljašnje dimenzije):\s*([^\r\n]+)/im
  );
  const grossRaw = matchDescription(
    description,
    /^(?:Ukupna masa|Bruto masa \(kg\))\s*:?\s*(\d+(?:[.,]\d+)?)/im
  );
  const curbRaw = matchDescription(
    description,
    /^(?:Težina prikolice|Masa prazne prikolice \(kg\))\s*:?\s*(\d+(?:[.,]\d+)?)/im
  );
  const wheelRaw = matchDescription(
    description,
    /^(?:Točkovi|Čelična felna[^:]*):\s*([^\r\n]+)/im
  );
  const floorRaw = matchDescription(
    description,
    /^(?:Pod prikolice|Ispuna poda):\s*([^\r\n]+)/im
  );
  const chassisRaw =
    matchDescription(description, /^Šasija:\s*([^\r\n]+)/im) ||
    matchDescription(description, /;\s*šasija:\s*([^;\r\n]+)/i) ||
    (/stranice prikolice i šasija:\s*toplocinkovane/i.test(description)
      ? "toplocinkovana"
      : null);

  return {
    cargoSpaceDimensions:
      CARGO_SPACE_OVERRIDES[args.slug] || normalizeDimensions(cargoRaw),
    externalDimensions:
      EXTERNAL_DIMENSIONS_OVERRIDES[args.slug] || normalizeDimensions(externalRaw),
    grossWeightKg:
      parseMass(grossRaw) ??
      (args.slug === "vesta-plato-2617" ? 1300 : args.fallbackGrossWeightKg ?? null),
    curbWeightKg:
      parseMass(curbRaw) ??
      (args.slug === "vesta-plato-2617" ? 277 : args.fallbackCurbWeightKg ?? null),
    axlesCount:
      resolveAxles(description) ?? (args.slug === "vesta-plato-2617" ? 1 : null),
    tiltType: resolveTrailerTiltType(args.slug, description),
    wheelSpecs: normalizeWheels(wheelRaw),
    floorType: capitalize(floorRaw),
    chassis: capitalize(chassisRaw),
    warrantyMonths: /Garancija[^\r\n]*24\s*mesec/i.test(description) ? 24 : null,
  };
}

function formatMass(value: number): string {
  return `${value.toLocaleString("sr-RS", { maximumFractionDigits: 1 })} kg`;
}

function formatAxles(value: number): string {
  if (value === 1) return "1 osovina";
  if (value >= 2 && value <= 4) return `${value} osovine`;
  return `${value} osovina`;
}

export function getTrailerCharacteristicRows(
  values: NormalizedTrailerCharacteristics
): TrailerCharacteristicRow[] {
  const rows: Array<TrailerCharacteristicRow | null> = [
    cleanText(values.cargoSpaceDimensions)
      ? { key: "cargo-space", label: "Tovarni prostor", value: values.cargoSpaceDimensions!.trim() }
      : null,
    cleanText(values.externalDimensions)
      ? { key: "external-dimensions", label: "Spoljašnje dimenzije", value: values.externalDimensions!.trim() }
      : null,
    values.grossWeightKg != null
      ? { key: "gross-weight", label: "Ukupna masa", value: formatMass(values.grossWeightKg) }
      : null,
    values.curbWeightKg != null
      ? { key: "curb-weight", label: "Masa prikolice", value: formatMass(values.curbWeightKg) }
      : null,
    values.axlesCount != null
      ? { key: "axles", label: "Broj osovina", value: formatAxles(values.axlesCount) }
      : null,
    values.tiltType
      ? {
          key: "tilt",
          label: "Kip",
          value: values.tiltType === "hydraulic" ? "Hidraulični" : "Mehanički",
        }
      : null,
    cleanText(values.wheelSpecs)
      ? { key: "wheels", label: "Točkovi", value: values.wheelSpecs!.trim() }
      : null,
    cleanText(values.floorType)
      ? { key: "floor", label: "Pod", value: values.floorType!.trim() }
      : null,
    cleanText(values.chassis)
      ? { key: "chassis", label: "Konstrukcija šasije", value: values.chassis!.trim() }
      : null,
    values.warrantyMonths != null
      ? { key: "warranty", label: "Garancija", value: `${values.warrantyMonths} meseca` }
      : null,
  ];

  return rows.filter((row): row is TrailerCharacteristicRow => row !== null);
}

export function getPovuciTrailerCharacteristicRows(
  trailer: PovuciTrailer
): TrailerCharacteristicRow[] {
  const floorType = trailer.category_id === "nautika-camci"
    ? null
    : trailer.floor_type;

  return getTrailerCharacteristicRows({
    cargoSpaceDimensions: trailer.cargo_space_dimensions,
    externalDimensions: trailer.external_dimensions,
    grossWeightKg: trailer.gross_weight_kg,
    curbWeightKg: trailer.curb_weight_kg,
    axlesCount: trailer.axles_count,
    tiltType: trailer.tilt_type,
    wheelSpecs: normalizeWheels(trailer.wheel_specs),
    floorType,
    chassis: trailer.chassis,
    warrantyMonths: trailer.warranty_months,
  });
}

export function getCatalogTrailerCharacteristicRows(
  trailer: CatalogTrailer
): TrailerCharacteristicRow[] {
  const floorType = trailer.categoryId === "nautika-camci"
    ? null
    : trailer.floorType ?? null;

  return getTrailerCharacteristicRows({
    cargoSpaceDimensions: trailer.cargoSpaceDimensions ?? null,
    externalDimensions: trailer.externalDimensions ?? null,
    grossWeightKg: trailer.grossWeightKg,
    curbWeightKg: trailer.curbWeightKg,
    axlesCount: trailer.axlesCount,
    tiltType: trailer.tiltType ?? null,
    wheelSpecs: normalizeWheels(trailer.wheelSpecs),
    floorType,
    chassis: trailer.chassis ?? null,
    warrantyMonths: trailer.warrantyMonths ?? null,
  });
}
