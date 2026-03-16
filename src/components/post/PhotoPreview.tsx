"use client";

import { useState, useMemo } from "react";
import { Button, Input, Space, Typography, Image as AntImage } from "antd";
import { SendOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Text } = Typography;

const CAPTION_MAX_LENGTH = 100;

interface PhotoPreviewProps {
  files: File[];
  loading: boolean;
  onSubmit: (caption: string) => void;
  onBack: () => void;
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
        {previews.map((src, index) => (
          <div
            key={index}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              aspectRatio: "1",
            }}
          >
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
          </div>
        ))}
      </div>

      <Space direction="vertical" size="middle" style={{ flex: 1 }}>
        <Input
          placeholder="Add a caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={CAPTION_MAX_LENGTH}
          showCount
          size="large"
          disabled={loading}
        />

        <Text type="secondary" style={{ fontSize: 12 }}>
          {files.length} photo{files.length > 1 ? "s" : ""} ready to share
        </Text>
      </Space>

      <Button
        type="primary"
        size="large"
        icon={<SendOutlined />}
        block
        loading={loading}
        onClick={handleSubmit}
        style={{ height: 56, fontSize: 16, marginTop: 24 }}
      >
        Post
      </Button>
    </div>
  );
}
