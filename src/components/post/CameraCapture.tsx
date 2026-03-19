"use client";

import { useRef } from "react";
import { Button, Space, Typography } from "antd";
import { CameraOutlined, PictureOutlined } from "@ant-design/icons";

import type { EventTheme } from "@/types";

const { Text } = Typography;

interface CameraCaptureProps {
  onPhotosSelected: (files: File[]) => void;
  allowVideo: boolean;
  allowChooseFromLibrary: boolean;
  theme: EventTheme;
}

/**
 * Camera capture screen. Uses native file inputs to open the device camera
 * or photo library. More reliable than WebRTC on mobile browsers.
 */
export function CameraCapture({
  onPhotosSelected,
  allowVideo,
  allowChooseFromLibrary,
  theme,
}: CameraCaptureProps): React.ReactElement {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const accept = allowVideo ? "image/*,video/*" : "image/*";
  const mediaLabel = allowVideo ? "photo/video" : "photo";

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onPhotosSelected(Array.from(files));
    }
    // Reset so same file can be selected again
    e.target.value = "";
  };

  const buttonStyle = {
    height: 56,
    fontSize: 16,
    backgroundColor: theme.buttonColor,
    borderColor: theme.buttonColor,
    color: "#fff",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 24,
        background: theme.backgroundColor,
      }}
    >
      <Text style={{ fontSize: 18, color: theme.subtextColor }}>
        Take a {mediaLabel} {allowChooseFromLibrary ? "or choose from your library" : ""}
      </Text>

      <Space direction="vertical" size="middle" style={{ width: "100%", maxWidth: 300 }}>
        <Button
          size="large"
          icon={<CameraOutlined />}
          block
          style={buttonStyle}
          onClick={() => cameraInputRef.current?.click()}
        >
          Take a {allowVideo ? "Photo/Video" : "Photo"}
        </Button>

        {allowChooseFromLibrary && (
          <Button
            size="large"
            icon={<PictureOutlined />}
            block
            style={{
              height: 56,
              fontSize: 16,
              backgroundColor: theme.secondaryButtonColor,
              borderColor: theme.secondaryButtonColor,
              color: "#fff",
            }}
            onClick={() => libraryInputRef.current?.click()}
          >
            Choose from Library
          </Button>
        )}
      </Space>

      {/* Hidden native file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        onChange={handleFiles}
        style={{ display: "none" }}
      />
      {allowChooseFromLibrary && (
        <input
          ref={libraryInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFiles}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}
