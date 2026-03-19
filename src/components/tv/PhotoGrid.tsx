"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Typography } from "antd";

import { PhotoTile } from "./PhotoTile";
import { QROverlay } from "./QROverlay";
import { usePolling } from "@/hooks/usePolling";
import { getTimeWindowCutoff } from "@/lib/utils";
import type { Post, EventSettings } from "@/types";

const { Title, Text } = Typography;

const SWAP_INTERVAL_MS = 5000;

interface PhotoGridProps {
  eventId: string;
  eventName: string;
  eventSlug: string;
  initialPosts: Post[];
  settings: EventSettings;
}

/**
 * Calculate grid dimensions to fill the viewport with square cells.
 */
function calcGrid(width: number, height: number): { cols: number; rows: number } {
  const cellSize = 280;
  const cols = Math.max(1, Math.round(width / cellSize));
  const rows = Math.max(1, Math.round(height / cellSize)) + 3;
  return { cols, rows };
}

/**
 * Full-viewport photo grid for the TV display.
 * Square base cells; portrait spans 2 rows, landscape spans 2 cols.
 * Rotates through posts when there are more than fit on screen.
 */
export function PhotoGrid({
  eventId,
  eventName,
  eventSlug,
  initialPosts,
  settings,
}: PhotoGridProps): React.ReactElement {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [grid, setGrid] = useState({ cols: 4, rows: 3 });
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const swapTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const postUrl = `${baseUrl}/${eventSlug}/post`;

  const capacity = grid.cols * grid.rows;

  // Calculate grid on mount and resize
  useEffect(() => {
    const update = (): void => {
      setGrid(calcGrid(window.innerWidth, window.innerHeight));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Set visible posts when posts change
  useEffect(() => {
    if (posts.length === 0) return;
    setVisibleIds(posts.slice(0, capacity).map((p) => p.id));
  }, [posts, capacity]);

  // Rotate: swap one visible tile with a queued post
  useEffect(() => {
    if (posts.length <= capacity) return;

    if (swapTimerRef.current) clearInterval(swapTimerRef.current);

    swapTimerRef.current = setInterval(() => {
      setVisibleIds((prev) => {
        const visibleSet = new Set(prev);
        const queued = posts.filter((p) => !visibleSet.has(p.id));
        if (queued.length === 0) return prev;

        const swapIndex = Math.floor(Math.random() * prev.length);
        const newPost = queued[Math.floor(Math.random() * queued.length)];

        const next = [...prev];
        next[swapIndex] = newPost.id;
        return next;
      });
    }, SWAP_INTERVAL_MS);

    return () => {
      if (swapTimerRef.current) clearInterval(swapTimerRef.current);
    };
  }, [posts, capacity]);

  // Poll for new posts
  const fetchPosts = useCallback(async (): Promise<void> => {
    try {
      const since =
        posts.length >= 100 ? getTimeWindowCutoff().toISOString() : undefined;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query Posts($eventId: ID!, $since: DateTime) {
              posts(eventId: $eventId, since: $since) {
                id
                caption
                dateCreated
                photos {
                  id
                  url
                  mediaType
                  width
                  height
                  order
                  dateCreated
                }
              }
            }
          `,
          variables: { eventId, since },
        }),
      });

      const result = await response.json();
      if (result.data?.posts) {
        setPosts(result.data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, [eventId, posts.length]);

  usePolling(fetchPosts, 3000);

  const postsById = new Map(posts.map((p) => [p.id, p]));
  const visiblePosts = visibleIds
    .map((id) => postsById.get(id))
    .filter((p): p is Post => p !== undefined);

  if (posts.length === 0) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: settings.theme.backgroundColor,
          gap: 16,
        }}
      >
        <Title level={2} style={{ color: settings.theme.textColor, margin: 0 }}>
          {eventName}
        </Title>
        <Text style={{ color: "#888", fontSize: 18 }}>
          Scan the QR code to post the first photo!
        </Text>
        <QROverlay postUrl={postUrl} />
      </div>
    );
  }

  return (
    <div style={{ background: settings.theme.backgroundColor }}>
      <div
        className="tv-grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {visiblePosts.map((post) => (
          <PhotoTile key={post.id} post={post} slideShowSpeed={settings.slideShowSpeed} />
        ))}
      </div>
      <QROverlay postUrl={postUrl} />
    </div>
  );
}
