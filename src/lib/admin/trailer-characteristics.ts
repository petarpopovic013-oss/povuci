import type { TrailerTiltType } from "@/types/trailer";

export function nullableText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

export function nullableNumber(formData: FormData, key: string): number | null {
  const value = nullableText(formData, key);
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function nullableInteger(formData: FormData, key: string): number | null {
  const value = nullableNumber(formData, key);
  return value != null && Number.isInteger(value) ? value : null;
}

export function trailerTiltType(formData: FormData): TrailerTiltType | null {
  const value = nullableText(formData, "tilt_type");
  return value === "mechanical" || value === "hydraulic" ? value : null;
}

export function parseSimpleDimensions(value: string | null): {
  length: number | null;
  width: number | null;
  height: number | null;
} {
  if (!value || /[-–]/.test(value)) {
    return { length: null, width: null, height: null };
  }

  const dimensions = value
    .replace(/\s*mm\s*$/i, "")
    .split(/\s*(?:×|x)\s*/i)
    .map(Number);
  const valid = (index: number) =>
    Number.isFinite(dimensions[index]) ? dimensions[index] : null;

  return {
    length: valid(0),
    width: valid(1),
    height: valid(2),
  };
}
