"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import type { Post } from "@/types";

interface PhotoTileProps {
  post: Post;
  slideShowSpeed: number;
}

/**
 * Get CSS class for grid spanning based on aspect ratio.
 * Portrait → spans 2 rows, landscape → spans 2 cols, square → 1x1.
 */
function getSpanClass(post: Post): string {
  const photo = post.photos[0];
  if (!photo?.width || !photo?.height) {
    // Videos with no dimensions default to 1x1 cell
    return "";
  }

  const ratio = photo.width / photo.height;
  if (ratio > 1.3) return "span-2-col";
  if (ratio < 0.77) return "span-2-row";
  return "";
}

/**
 * Displays a single photo tile in the TV grid.
 * Crops to fill the cell, keeping the center of the image visible.
 * For multi-photo posts, crossfades between photos.
 */
export function PhotoTile({ post, slideShowSpeed }: PhotoTileProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiplePhotos = post.photos.length > 1;
  const spanClass = getSpanClass(post);

  useEffect(() => {
    if (!hasMultiplePhotos) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % post.photos.length);
    }, slideShowSpeed * 1000);

    return () => clearInterval(interval);
  }, [hasMultiplePhotos, post.photos.length, slideShowSpeed]);

  return (
    <div className={`photo-tile photo-tile-enter ${spanClass}`}>
      {post.photos.map((photo, index) =>
        photo.mediaType === "video" ? (
          <video
            key={photo.id}
            src={photo.url}
            muted
            autoPlay
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              opacity: index === activeIndex ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          />
        ) : (
          <Image
            key={photo.id}
            src={photo.url}
            alt={post.caption || "Event photo"}
            fill
            sizes="(min-width: 1200px) 25vw, 33vw"
            style={{
              objectFit: "cover",
              objectPosition: "center center",
              opacity: index === activeIndex ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          />
        )
      )}

      {post.caption && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 12px 10px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            fontSize: 14,
            color: "#fff",
          }}
        >
          {post.caption}
        </div>
      )}
    </div>
  );
}
