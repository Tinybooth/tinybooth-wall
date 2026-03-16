"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { themeConfig } from "@/theme/themeConfig";

/**
 * Client-side providers wrapper for Ant Design theme and SSR registry.
 */
export function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <AntdRegistry>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
