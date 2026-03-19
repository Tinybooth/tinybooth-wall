import { handleUpload } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
];

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Token endpoint for client-side Vercel Blob uploads.
 * Used by @vercel/blob/client to get an upload token for direct browser-to-blob uploads.
 * Only allows video file types up to 100MB.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        return {
          allowedContentTypes: ALLOWED_VIDEO_TYPES,
          maximumSizeInBytes: MAX_VIDEO_SIZE,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async () => {
        // No post-upload processing needed for videos
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload token error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
