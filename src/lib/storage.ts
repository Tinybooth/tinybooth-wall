import { put } from "@vercel/blob";
import sharp from "sharp";

import type { MediaType } from "@/types";

const MAX_WIDTH = 1920;
const THUMB_WIDTH = 400;

export interface SavedPhoto {
  url: string;
  mediaType: MediaType;
  width: number;
  height: number;
}

/**
 * Process and upload photos to Vercel Blob storage.
 * Auto-rotates based on EXIF, resizes to max 1920px wide, converts to WebP.
 * @param files - Array of File objects to upload
 * @param eventSlug - Event slug for organizing uploads
 * @returns Array of uploaded photo info with URLs and dimensions
 */
export async function savePhotos(
  files: File[],
  eventSlug: string
): Promise<SavedPhoto[]> {
  const results: SavedPhoto[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const processed = sharp(buffer)
      .rotate() // auto-rotate based on EXIF orientation
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 });

    const outputBuffer = await processed.toBuffer();
    const metadata = await sharp(outputBuffer).metadata();

    const filename = `${eventSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const blob = await put(filename, outputBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    results.push({
      url: blob.url,
      mediaType: "image" as const,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    });
  }

  return results;
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
