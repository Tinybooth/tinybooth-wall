"use client";

import { Typography } from "antd";
import { CreateEventForm } from "@/components/CreateEventForm";

const { Title } = Typography;

/**
 * Landing page — create a new event.
 */
export default function HomePage(): React.ReactElement {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Title
        level={1}
        style={{ textAlign: "center", marginBottom: 48, color: "#fafafa" }}
      >
        Crispy Waffle
      </Title>
      <CreateEventForm />
    </main>
  );
}
