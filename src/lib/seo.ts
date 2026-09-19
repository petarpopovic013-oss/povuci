export const SITE_URL = "https://povuci.rs";
export const SITE_NAME = "Povuci.rs";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
