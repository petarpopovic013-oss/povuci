import sharp from "sharp";

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Konvertuje bilo koji podržani format slike (JPEG, PNG, HEIC, TIFF, WebP, itd.)
 * u optimizovani WebP format sa auto-rotacijom (EXIF) i kompresijom.
 */
export async function optimizeImageToWebp(
  inputBuffer: Buffer | ArrayBuffer,
  options: OptimizeImageOptions = {}
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const { maxWidth = 1920, maxHeight = 1440, quality = 80 } = options;

  const rawBuffer = Buffer.isBuffer(inputBuffer)
    ? inputBuffer
    : Buffer.from(inputBuffer);

  const optimizedBuffer = await sharp(rawBuffer)
    .rotate() // Automatski rotira sliku prema EXIF metapodacima (kamere telefona)
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4, // Balans između brzine kompresije i veličine fajla
      lossless: false,
    })
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    contentType: "image/webp",
    extension: "webp",
  };
}
