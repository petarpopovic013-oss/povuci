export const SITE_URL = "https://povuci.rs";
export const SITE_NAME = "Povuci.rs";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function truncateSeoText(value: string, maxLength = 160): string {
  const compact = compactText(value);
  if (compact.length <= maxLength) return compact;

  const shortened = compact.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, Math.max(lastSpace, maxLength - 20)).trimEnd()}…`;
}

interface TrailerSeoDescriptionInput {
  title: string;
  brand: string;
  priceRsd: number | null;
}

export function getTrailerSeoDescription({
  title,
  brand,
  priceRsd,
}: TrailerSeoDescriptionInput): string {
  const priceText =
    priceRsd && priceRsd > 0
      ? `Cena ${priceRsd.toLocaleString("sr-RS")} RSD sa PDV-om.`
      : "Cena na upit.";

  return truncateSeoText(
    `${title}, nova ${brand} auto prikolica. ${priceText} Pogledajte tehničke karakteristike, fotografije i opremu. Garancija 24 meseca, COC i homologacija.`
  );
}
