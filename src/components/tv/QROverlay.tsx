"use client";

import { Typography } from "antd";
import { QRCodeSVG } from "qrcode.react";

const { Text } = Typography;

interface QROverlayProps {
  postUrl: string;
}

/**
 * QR code overlay in the corner of the TV display.
 * Guests scan this to open the photo upload page.
 */
export function QROverlay({ postUrl }: QROverlayProps): React.ReactElement {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 16,
        borderRadius: 16,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
      }}
    >
      <QRCodeSVG
        value={postUrl}
        size={120}
        bgColor="transparent"
        fgColor="#ffffff"
        level="M"
      />
      <Text
        strong
        style={{ color: "#fff", fontSize: 14 }}
      >
        Post a pic!
      </Text>
    </div>
  );
}
