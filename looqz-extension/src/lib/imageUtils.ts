export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export function isValidImageType(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function isValidImageSize(file: File, maxMB = 10): boolean {
  const maxSizeInBytes = maxMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export async function resizeImage(
  input: File | Blob,
  maxDimension = 1024,
): Promise<Blob> {
  const bitmap = await createImageBitmap(input);
  const { width, height } = bitmap;

  let targetW = width;
  let targetH = height;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      targetW = maxDimension;
      targetH = Math.round((height / width) * maxDimension);
    } else {
      targetH = maxDimension;
      targetW = Math.round((width / height) * maxDimension);
    }
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context for OffscreenCanvas");
  }

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  
  // Clean up bitmap to free memory
  bitmap.close();

  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}
