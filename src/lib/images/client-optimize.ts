const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1440;
const MAX_UPLOAD_BYTES = 3_500_000;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });
}

async function loadImage(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Fotografija ne može da se učita."));
      image.src = objectUrl;
    });

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

/**
 * Smanjuje fotografiju u browseru pre slanja kroz hosting proxy. Server je i
 * dalje konačno konvertuje, ali nikada ne mora da primi original od više MB.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  try {
    const image = await loadImage(file);

    try {
      const scale = Math.min(
        1,
        MAX_IMAGE_WIDTH / image.width,
        MAX_IMAGE_HEIGHT / image.height
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Fotografija ne može da se obradi.");

      context.drawImage(image.source, 0, 0, width, height);

      let optimized: Blob | null = null;
      for (const quality of [0.82, 0.7, 0.58]) {
        optimized = await canvasToBlob(canvas, quality);
        if (optimized && optimized.size <= MAX_UPLOAD_BYTES) break;
      }

      if (!optimized || optimized.size > MAX_UPLOAD_BYTES) {
        throw new Error("Fotografija je i nakon optimizacije prevelika.");
      }

      const baseName = file.name.replace(/\.[^.]+$/, "") || "fotografija";
      return new File([optimized], `${baseName}.webp`, {
        type: "image/webp",
        lastModified: file.lastModified,
      });
    } finally {
      image.close?.();
    }
  } catch (error) {
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw error;
  }
}
