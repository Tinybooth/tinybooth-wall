import type { ThemeConfig } from "antd";
import { theme } from "antd";

/**
 * Ant Design dark theme configuration for the event photo wall.
 * Uses dark algorithm with custom token overrides for the event aesthetic.
 */
export const themeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#7c3aed",
    colorBgBase: "#0a0a0a",
    colorBgContainer: "#141414",
    colorBgElevated: "#1f1f1f",
    borderRadius: 12,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: "#7c3aed",
      algorithm: true,
    },
    Input: {
      colorBgContainer: "#1f1f1f",
    },
  },
};
