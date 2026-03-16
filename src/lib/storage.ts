import { put } from "@vercel/blob";
import sharp from "sharp";

const MAX_WIDTH = 1920;
const THUMB_WIDTH = 400;

/**
 * Process and upload photos to Vercel Blob storage.
 * Resizes images to max 1920px wide and converts to WebP.
 * @param files - Array of File objects to upload
 * @param eventSlug - Event slug for organizing uploads
 * @returns Array of uploaded photo URLs
 */
export async function savePhotos(
  files: File[],
  eventSlug: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const processed = await sharp(buffer)
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${eventSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const blob = await put(filename, processed, {
      access: "public",
      contentType: "image/webp",
    });

    urls.push(blob.url);
  }

  return urls;
}

/**
 * Generate a thumbnail version of an image.
 * @param imageUrl - URL of the original image
 * @returns Buffer of the thumbnail
 */
export async function generateThumbnail(
  imageBuffer: Buffer
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
    .webp({ quality: 60 })
    .toBuffer();
}
