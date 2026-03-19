import type { MediaType } from "@/types";

/**
 * Determine whether a File is an image or video based on MIME type.
 * @param file - The file to check
 * @returns "image" or "video"
 */
export function getMediaType(file: File): MediaType {
  if (file.type.startsWith("video/")) {
    return "video";
  }
  return "image";
}

/**
 * Get the natural dimensions of a video file by loading it into a video element.
 * @param file - The video file
 * @returns width and height of the video
 */
export function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = (): void => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = (): void => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  });
}
