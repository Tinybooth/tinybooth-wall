"use client";

import { useRef } from "react";
import { Button, Space, Typography } from "antd";
import { CameraOutlined, PictureOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface CameraCaptureProps {
  onPhotosSelected: (files: File[]) => void;
}

/**
 * Camera capture screen. Uses native file inputs to open the device camera
 * or photo library. More reliable than WebRTC on mobile browsers.
 */
export function CameraCapture({
  onPhotosSelected,
}: CameraCaptureProps): React.ReactElement {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onPhotosSelected(Array.from(files));
    }
    // Reset so same file can be selected again
    e.target.value = "";
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
      }}
    >
      <Text style={{ fontSize: 18, color: "#aaa" }}>
        Take a photo or choose from your library
      </Text>

      <Space direction="vertical" size="middle" style={{ width: "100%", maxWidth: 300 }}>
        <Button
          type="primary"
          size="large"
          icon={<CameraOutlined />}
          block
          style={{ height: 56, fontSize: 16 }}
          onClick={() => cameraInputRef.current?.click()}
        >
          Take a Photo
        </Button>

        <Button
          size="large"
          icon={<PictureOutlined />}
          block
          style={{ height: 56, fontSize: 16 }}
          onClick={() => libraryInputRef.current?.click()}
        >
          Choose from Library
        </Button>
      </Space>

      {/* Hidden native file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
        style={{ display: "none" }}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />
    </div>
  );
}
