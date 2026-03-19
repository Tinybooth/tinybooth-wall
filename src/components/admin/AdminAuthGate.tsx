"use client";

import { useState, useCallback } from "react";
import { Button, Input, Typography, Card, Space } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const { Title, Text } = Typography;

const ADMIN_PASSWORD = "deezNUTSZ!420";
const AUTH_STORAGE_KEY = "tinybooth-wall-admin-auth";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

/**
 * Client-side password gate for the admin section.
 * Stores auth state in sessionStorage so it persists across page navigations
 * but clears when the browser tab is closed.
 */
export function AdminAuthGate({ children }: AdminAuthGateProps): React.ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>(AUTH_STORAGE_KEY, false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = useCallback((): void => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  }, [password, setIsAuthenticated]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#0a0a0a",
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: "100%",
          background: "#141414",
          border: "1px solid #303030",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <LockOutlined style={{ fontSize: 32, color: "#922B21", marginBottom: 12 }} />
            <Title level={3} style={{ margin: 0 }}>
              Admin Access
            </Title>
            <Text type="secondary">Enter the admin password to continue</Text>
          </div>

          <Input.Password
            size="large"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onPressEnter={handleSubmit}
            status={error ? "error" : undefined}
          />

          {error && (
            <Text type="danger">Incorrect password. Please try again.</Text>
          )}

          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
          >
            Sign In
          </Button>
        </Space>
      </Card>
    </div>
  );
}
