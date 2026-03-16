"use client";

import { Button, Typography, Space } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

/**
 * 404 page shown when an event slug doesn't exist.
 */
export default function NotFound(): React.ReactElement {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
      }}
    >
      <Space direction="vertical" size="large" align="center">
        <Title level={2} style={{ color: "#fafafa", margin: 0 }}>
          Event not found
        </Title>
        <Text style={{ color: "#888", fontSize: 16 }}>
          This event doesn&apos;t exist or may have been removed.
        </Text>
        <Link href="/">
          <Button type="primary" size="large">
            Go Home
          </Button>
        </Link>
      </Space>
    </main>
  );
}
