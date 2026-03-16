"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import type { Post } from "@/types";
import { getTileSize } from "@/lib/utils";

interface PhotoTileProps {
  post: Post;
}

/**
 * Displays a single photo tile in the TV collage grid.
 * For multi-photo posts, crossfades between photos on an interval.
 */
export function PhotoTile({ post }: PhotoTileProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiplePhotos = post.photos.length > 1;
  const size = getTileSize(post.id);

  useEffect(() => {
    if (!hasMultiplePhotos) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % post.photos.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [hasMultiplePhotos, post.photos.length]);

  const sizeClass = size === "large" ? "span-2-col span-2-row" : "";

  return (
    <div
      className={`photo-tile-enter ${sizeClass}`}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        background: "#1a1a1a",
      }}
    >
      {post.photos.map((photo, index) => (
        <Image
          key={photo.id}
          src={photo.url}
          alt={post.caption || "Event photo"}
          fill
          sizes={size === "large" ? "560px" : "280px"}
          style={{
            objectFit: "cover",
            opacity: index === activeIndex ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
        />
      ))}

      {post.caption && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 12px 10px",
            background:
              "linear-gradient(transparent, rgba(0,0,0,0.7))",
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
