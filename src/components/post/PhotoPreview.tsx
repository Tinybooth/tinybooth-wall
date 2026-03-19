"use client";

import { useState, useMemo } from "react";
import { Button, Input, Space, Typography, Image as AntImage } from "antd";
import { SendOutlined, ArrowLeftOutlined, PlayCircleFilled } from "@ant-design/icons";

import { getMediaType } from "@/lib/media";
import type { EventTheme } from "@/types";

const { Text } = Typography;

const CAPTION_MAX_LENGTH = 100;

interface PhotoPreviewProps {
  files: File[];
  loading: boolean;
  onSubmit: (caption: string) => void;
  onBack: () => void;
  allowCaptions: boolean;
  theme: EventTheme;
}

/**
 * Photo preview screen with optional caption input.
 * Shows thumbnails of selected photos and a submit button.
 */
export function PhotoPreview({
  files,
  loading,
  onSubmit,
  onBack,
  allowCaptions,
  theme,
}: PhotoPreviewProps): React.ReactElement {
  const [caption, setCaption] = useState("");

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  const handleSubmit = (): void => {
    onSubmit(caption.trim());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        disabled={loading}
        style={{ alignSelf: "flex-start", marginBottom: 16 }}
      >
        Back
      </Button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: files.length === 1 ? "1fr" : "1fr 1fr",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {previews.map((src, index) => {
          const isVideo = getMediaType(files[index]) === "video";
          return (
            <div
              key={index}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                aspectRatio: "1",
                position: "relative",
              }}
            >
              {isVideo ? (
                <video
                  src={src}
                  muted
                  autoPlay
                  loop
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <AntImage
                  src={src}
                  alt={`Photo ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  preview={false}
                />
              )}
              {isVideo && (
                <PlayCircleFilled
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: 24,
                    color: "rgba(255,255,255,0.85)",
                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <Space direction="vertical" size="middle" style={{ flex: 1 }}>
        {allowCaptions && (
          <Input
            placeholder="Add a caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={CAPTION_MAX_LENGTH}
            showCount
            size="large"
            disabled={loading}
          />
        )}

        <Text type="secondary" style={{ fontSize: 12 }}>
          {(() => {
            const imageCount = files.filter((f) => getMediaType(f) === "image").length;
            const videoCount = files.filter((f) => getMediaType(f) === "video").length;
            const parts: string[] = [];
            if (imageCount > 0) parts.push(`${imageCount} photo${imageCount > 1 ? "s" : ""}`);
            if (videoCount > 0) parts.push(`${videoCount} video${videoCount > 1 ? "s" : ""}`);
            return `${parts.join(", ")} ready to share`;
          })()}
        </Text>
      </Space>

      <Button
        size="large"
        icon={<SendOutlined />}
        block
        loading={loading}
        onClick={handleSubmit}
        style={{
          height: 56,
          fontSize: 16,
          marginTop: 24,
          backgroundColor: theme.buttonColor,
          borderColor: theme.buttonColor,
          color: "#fff",
        }}
      >
        Post
      </Button>
    </div>
  );
}
