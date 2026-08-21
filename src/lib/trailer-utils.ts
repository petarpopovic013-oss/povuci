import type { PovuciTrailerOption } from "../types/trailer";

/**
 * Extracts optional accessories (Dodatne opcije) from unstructured text description
 */
export function parseOptionsFromDescription(description?: string | null): PovuciTrailerOption[] {
  if (!description) return [];

  const options: PovuciTrailerOption[] = [];
  const optionsIndex = description.toLowerCase().indexOf("dodatne opcije");
  if (optionsIndex === -1) return [];

  const afterOptions = description.slice(optionsIndex);
  const lines = afterOptions.split("\n");

  let sortOrder = 1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.toLowerCase().includes("dodatne opcije") ||
      trimmed.toLowerCase().includes("cene su u") ||
      trimmed.toLowerCase().includes("na slikama") ||
      trimmed.toLowerCase().includes("zadržavamo pravo")
    ) {
      continue;
    }

    // Match lines like "Cerada prekrivka - 9.400" or "Rezervni točak sa nosačem 15.400"
    const match = trimmed.match(/^([^:-–]+)[:\-–\s]+([\d.,]+(?:\s*din|\s*eur)?.*)$/i);
    if (match) {
      const name = match[1].trim();
      const rawPrice = match[2].trim();
      // Parse numeric price if possible
      const numMatch = rawPrice.replace(/\./g, "").match(/(\d+)/);
      const priceRsd = numMatch ? parseInt(numMatch[1], 10) : 0;

      if (name.length > 2 && priceRsd > 0) {
        let category = "ostalo";
        const lower = name.toLowerCase();
        if (lower.includes("cerad") || lower.includes("arnjev")) category = "cerada";
        else if (lower.includes("točak") || lower.includes("tocak") || lower.includes("nosač")) category = "tockovi";
        else if (lower.includes("ramp") || lower.includes("staza")) category = "rampe";
        else if (lower.includes("stop") || lower.includes("podupirač")) category = "stope";
        else if (lower.includes("nadogradnj") || lower.includes("stranic") || lower.includes("ram")) category = "nadogradnja";

        options.push({
          id: `opt-${sortOrder}`,
          trailer_id: null,
          name,
          price_rsd: priceRsd,
          category,
          is_available: true,
          sort_order: sortOrder++,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return options;
}

/**
 * Parses technical details list from raw description text
 */
export function parseTechSpecsFromDescription(description?: string | null): Record<string, string> {
  if (!description) return {};

  const specs: Record<string, string> = {};
  const lines = description.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx > 0 && colonIdx < 45) {
      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();
      if (
        key &&
        value &&
        !key.toLowerCase().includes("cena") &&
        !key.toLowerCase().includes("garancija") &&
        !key.toLowerCase().includes("dodatne")
      ) {
        specs[key] = value;
      }
    }
  }

  return specs;
}
