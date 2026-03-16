"use client";

import { useState, useMemo } from "react";
import { Typography, Modal } from "antd";
import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import Image from "next/image";

import type { Post } from "@/types";

const { Text } = Typography;

interface PostFeedProps {
  eventName: string;
  posts: Post[];
}

/**
 * Deterministic pseudo-random number from a string seed.
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

/**
 * A single polaroid-style photo card with slight random rotation.
 */
function Polaroid({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}): React.ReactElement {
  const rand = seededRandom(post.id);
  const rotation = (rand - 0.5) * 8; // -4 to +4 degrees

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-block",
        cursor: "pointer",
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        background: "#fff",
        padding: "12px 12px 40px 12px",
        borderRadius: 2,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `rotate(0deg) scale(1.03)`;
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
        e.currentTarget.style.zIndex = "10";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)";
        e.currentTarget.style.zIndex = "1";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1", background: "#eee" }}>
        <Image
          src={post.photos[0].url}
          alt={post.caption || "Event photo"}
          fill
          sizes="300px"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {post.photos.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 10,
            }}
          >
            +{post.photos.length - 1}
          </div>
        )}
      </div>
      {post.caption && (
        <div
          style={{
            marginTop: 8,
            color: "#333",
            fontSize: 14,
            textAlign: "center",
            fontStyle: "italic",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {post.caption}
        </div>
      )}
    </div>
  );
}

/**
 * Lightbox modal for viewing a post's photos fullscreen.
 */
function Lightbox({
  post,
  open,
  onClose,
}: {
  post: Post | null;
  open: boolean;
  onClose: () => void;
}): React.ReactElement | null {
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!post) return null;

  const photo = post.photos[photoIndex] || post.photos[0];
  const hasMultiple = post.photos.length > 1;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="90vw"
      closeIcon={<CloseOutlined style={{ color: "#fff", fontSize: 20 }} />}
      styles={{
        content: { background: "transparent", boxShadow: "none", padding: 0 },
        mask: { backgroundColor: "rgba(0,0,0,0.9)" },
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
        <Image
          src={photo.url}
          alt={post.caption || "Event photo"}
          fill
          sizes="90vw"
          style={{ objectFit: "contain" }}
        />

        {hasMultiple && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIndex((i) => (i - 1 + post.photos.length) % post.photos.length);
              }}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                border: "none",
                color: "#fff",
                fontSize: 24,
                width: 44,
                height: 44,
                borderRadius: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LeftOutlined />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIndex((i) => (i + 1) % post.photos.length);
              }}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                border: "none",
                color: "#fff",
                fontSize: 24,
                width: 44,
                height: 44,
                borderRadius: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RightOutlined />
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                fontSize: 13,
                padding: "4px 12px",
                borderRadius: 12,
              }}
            >
              {photoIndex + 1} / {post.photos.length}
            </div>
          </>
        )}
      </div>

      {post.caption && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{post.caption}</Text>
        </div>
      )}
    </Modal>
  );
}

/**
 * Polaroid memory board — event photos scattered like polaroids on a board.
 * Click to open a fullscreen lightbox.
 */
export function PostFeed({ eventName, posts }: PostFeedProps): React.ReactElement {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Flatten multi-photo posts: each photo gets its own polaroid
  const polaroids = useMemo(() => {
    return posts;
  }, [posts]);

  return (
    <div style={{ minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Text strong style={{ fontSize: 28, color: "#fafafa", letterSpacing: 1 }}>
          {eventName}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 14 }}>
          {posts.length} moment{posts.length !== 1 ? "s" : ""} captured
        </Text>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            No photos yet — be the first!
          </Text>
        </div>
      ) : (
        <div
          style={{
            columns: "260px",
            columnGap: 20,
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {polaroids.map((post) => (
            <div key={post.id} style={{ breakInside: "avoid", marginBottom: 20 }}>
              <Polaroid post={post} onClick={() => setSelectedPost(post)} />
            </div>
          ))}
        </div>
      )}

      <Lightbox
        post={selectedPost}
        open={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
