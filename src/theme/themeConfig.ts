import type { ThemeConfig } from "antd";
import { theme } from "antd";

/**
 * Ant Design dark theme configuration for the event photo wall.
 * Colors pulled from marloncaytlynn.framer.website — forest green + deep red.
 */
export const themeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#922B21",
    colorSuccess: "#126849",
    colorError: "#922B21",
    colorBgBase: "#0a0a0a",
    colorBgContainer: "#141414",
    colorBgElevated: "#1f1f1f",
    borderRadius: 12,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      colorPrimary: "#922B21",
      algorithm: true,
    },
    Input: {
      colorBgContainer: "#1f1f1f",
    },
  },
};
