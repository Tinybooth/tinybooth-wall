"use client";

import { useState, useCallback } from "react";
import { Typography } from "antd";

import { PhotoTile } from "./PhotoTile";
import { QROverlay } from "./QROverlay";
import { usePolling } from "@/hooks/usePolling";
import { getTimeWindowCutoff } from "@/lib/utils";
import type { Post } from "@/types";

const { Title, Text } = Typography;

interface PhotoGridProps {
  eventId: string;
  eventName: string;
  eventSlug: string;
  initialPosts: Post[];
}

/**
 * Full-viewport photo grid for the TV display.
 * Polls for new posts every 3 seconds and manages time windowing.
 */
export function PhotoGrid({
  eventId,
  eventName,
  eventSlug,
  initialPosts,
}: PhotoGridProps): React.ReactElement {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const postUrl = `${baseUrl}/${eventSlug}/post`;

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
          background: "#0a0a0a",
          gap: 16,
        }}
      >
        <Title level={2} style={{ color: "#fafafa", margin: 0 }}>
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
    <div style={{ background: "#0a0a0a" }}>
      <div className="tv-grid">
        {posts.map((post) => (
          <PhotoTile key={post.id} post={post} />
        ))}
      </div>
      <QROverlay postUrl={postUrl} />
    </div>
  );
}
