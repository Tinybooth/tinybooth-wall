"use client";

import { Button, Typography, Space } from "antd";
import { CameraOutlined } from "@ant-design/icons";

import type { EventTheme } from "@/types";

const { Title, Text } = Typography;

interface WelcomeScreenProps {
  eventName: string;
  onConfirm: () => void;
  theme: EventTheme;
}

/**
 * Welcome screen shown to first-time guests.
 * Explains the event and prompts them to start sharing photos.
 */
export function WelcomeScreen({
  eventName,
  onConfirm,
  theme,
}: WelcomeScreenProps): React.ReactElement {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        background: theme.backgroundColor,
      }}
    >
      <Space direction="vertical" size="large" align="center">
        <CameraOutlined style={{ fontSize: 64, color: theme.buttonColor }} />
        <Title level={2} style={{ margin: 0, color: theme.textColor }}>
          {eventName}
        </Title>
        <Text style={{ fontSize: 16, color: theme.subtextColor, maxWidth: 300 }}>
          Share your photos and see them appear live on the big screen!
        </Text>
        <Button
          size="large"
          onClick={onConfirm}
          style={{
            marginTop: 16,
            height: 56,
            fontSize: 18,
            paddingInline: 48,
            backgroundColor: theme.buttonColor,
            borderColor: theme.buttonColor,
            color: "#fff",
          }}
        >
          Let&apos;s go!
        </Button>
      </Space>
    </div>
  );
}
