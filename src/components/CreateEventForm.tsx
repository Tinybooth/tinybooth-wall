"use client";

import { useState } from "react";
import { Button, Input, Typography, Card, Space, message } from "antd";
import { QRCodeSVG } from "qrcode.react";

import type { Event } from "@/types";

const { Title, Text, Paragraph } = Typography;

/**
 * Form to create a new event. Shows the TV display URL and QR code on success.
 */
export function CreateEventForm(): React.ReactElement {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);

  const handleCreate = async (): Promise<void> => {
    if (!name.trim()) {
      message.warning("Please enter an event name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreateEvent($name: String!) {
              createEvent(name: $name) {
                id
                name
                slug
                dateCreated
                posts {
                  id
                }
              }
            }
          `,
          variables: { name: name.trim() },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setCreatedEvent(result.data.createEvent);
      setName("");
      message.success("Event created!");
    } catch (error) {
      console.error("Failed to create event:", error);
      message.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");

  if (createdEvent) {
    const tvUrl = `${baseUrl}/${createdEvent.slug}`;
    const postUrl = `${baseUrl}/${createdEvent.slug}/post`;

    return (
      <Card
        style={{
          maxWidth: 480,
          margin: "0 auto",
          background: "#141414",
          border: "1px solid #303030",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>
            {createdEvent.name}
          </Title>

          <div>
            <Text type="secondary">TV Display URL:</Text>
            <Paragraph
              copyable
              style={{ fontSize: 16, marginBottom: 0, marginTop: 4 }}
            >
              {tvUrl}
            </Paragraph>
          </div>

          <div>
            <Text type="secondary">Guest Upload URL:</Text>
            <Paragraph
              copyable
              style={{ fontSize: 16, marginBottom: 0, marginTop: 4 }}
            >
              {postUrl}
            </Paragraph>
          </div>

          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <QRCodeSVG
              value={postUrl}
              size={200}
              bgColor="#141414"
              fgColor="#ffffff"
              level="M"
            />
            <br />
            <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
              Scan to post photos
            </Text>
          </div>

          <Button
            block
            onClick={() => setCreatedEvent(null)}
          >
            Create Another Event
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Card
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: "#141414",
        border: "1px solid #303030",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ margin: 0 }}>
          Create an Event
        </Title>
        <Text type="secondary">
          Set up a live photo wall for your event. Guests will scan a QR code to
          share photos.
        </Text>
        <Input
          size="large"
          placeholder="Event name (e.g., Sarah & Mike's Wedding)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleCreate}
          maxLength={100}
        />
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleCreate}
        >
          Create Event
        </Button>
      </Space>
    </Card>
  );
}
