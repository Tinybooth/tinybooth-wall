import { NextRequest, NextResponse } from "next/server";
import { savePhotos } from "@/lib/storage";

/**
 * REST endpoint for photo uploads.
 * Accepts multipart form data with files and an event slug.
 * Processes images (resize + WebP) and uploads to Vercel Blob.
 * Returns array of uploaded photo URLs.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const eventSlug = formData.get("eventSlug");

    if (!eventSlug || typeof eventSlug !== "string") {
      return NextResponse.json(
        { error: "eventSlug is required" },
        { status: 400 }
      );
    }

    const files: File[] = formData
      .getAll("photos")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one photo is required" },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 photos per upload" },
        { status: 400 }
      );
    }

    const urls = await savePhotos(files, eventSlug);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}
