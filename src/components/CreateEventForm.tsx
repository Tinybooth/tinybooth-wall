"use client";

import { useState } from "react";
import {
  Button,
  Input,
  InputNumber,
  Typography,
  Card,
  Space,
  Switch,
  ColorPicker,
  Slider,
  Collapse,
  message,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";

import { DEFAULT_EVENT_SETTINGS } from "@/types";
import type { Event, EventSettings } from "@/types";

const { Title, Text, Paragraph } = Typography;

/**
 * Form to create a new event. Shows the TV display URL and QR code on success.
 */
export function CreateEventForm(): React.ReactElement {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);

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
                settings {
                  theme {
                    buttonColor
                    secondaryButtonColor
                    textColor
                    subtextColor
                    backgroundColor
                  }
                  allowChooseFromLibrary
                  allowVideo
                  allowCaptions
                  maxPhotosPerPost
                  slideShowSpeed
                }
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

      const created = result.data.createEvent;

      // Save settings immediately after creation
      const settingsResponse = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation AdminUpdateEventSettings($id: ID!, $settings: EventSettingsInput!) {
              adminUpdateEventSettings(id: $id, settings: $settings) {
                id
              }
            }
          `,
          variables: { id: created.id, settings },
        }),
      });

      const settingsResult = await settingsResponse.json();
      if (settingsResult.errors) {
        console.error("Failed to save settings:", settingsResult.errors);
      }

      setCreatedEvent(created);
      setName("");
      setSettings(DEFAULT_EVENT_SETTINGS);
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

        <Collapse
          ghost
          items={[
            {
              key: "settings",
              label: (
                <Space>
                  <SettingOutlined />
                  <Text type="secondary">Event Settings</Text>
                </Space>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  {/* Theme */}
                  <div>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>Theme</Text>
                    <Space size="large" wrap>
                      <div>
                        <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Button</Text>
                        <ColorPicker
                          value={settings.theme.buttonColor}
                          onChange={(_, hex) =>
                            setSettings((s) => ({ ...s, theme: { ...s.theme, buttonColor: hex } }))
                          }
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Secondary</Text>
                        <ColorPicker
                          value={settings.theme.secondaryButtonColor}
                          onChange={(_, hex) =>
                            setSettings((s) => ({ ...s, theme: { ...s.theme, secondaryButtonColor: hex } }))
                          }
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Text</Text>
                        <ColorPicker
                          value={settings.theme.textColor}
                          onChange={(_, hex) =>
                            setSettings((s) => ({ ...s, theme: { ...s.theme, textColor: hex } }))
                          }
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Subtext</Text>
                        <ColorPicker
                          value={settings.theme.subtextColor}
                          onChange={(_, hex) =>
                            setSettings((s) => ({ ...s, theme: { ...s.theme, subtextColor: hex } }))
                          }
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Background</Text>
                        <ColorPicker
                          value={settings.theme.backgroundColor}
                          onChange={(_, hex) =>
                            setSettings((s) => ({ ...s, theme: { ...s.theme, backgroundColor: hex } }))
                          }
                        />
                      </div>
                    </Space>
                  </div>

                  {/* Toggles */}
                  <Space size="large" wrap>
                    <div>
                      <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Library Uploads</Text>
                      <Switch
                        checked={settings.allowChooseFromLibrary}
                        onChange={(checked) => setSettings((s) => ({ ...s, allowChooseFromLibrary: checked }))}
                      />
                    </div>
                    <div>
                      <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Video</Text>
                      <Switch
                        checked={settings.allowVideo}
                        onChange={(checked) => setSettings((s) => ({ ...s, allowVideo: checked }))}
                      />
                    </div>
                    <div>
                      <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Captions</Text>
                      <Switch
                        checked={settings.allowCaptions}
                        onChange={(checked) => setSettings((s) => ({ ...s, allowCaptions: checked }))}
                      />
                    </div>
                  </Space>

                  {/* Numeric */}
                  <Space size="large" wrap>
                    <div>
                      <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>Max Per Post</Text>
                      <InputNumber
                        min={1}
                        max={20}
                        value={settings.maxPhotosPerPost}
                        onChange={(val) => setSettings((s) => ({ ...s, maxPhotosPerPost: val ?? 10 }))}
                      />
                    </div>
                    <div style={{ minWidth: 160 }}>
                      <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
                        Slideshow: {settings.slideShowSpeed}s
                      </Text>
                      <Slider
                        min={1}
                        max={10}
                        step={0.5}
                        value={settings.slideShowSpeed}
                        onChange={(val) => setSettings((s) => ({ ...s, slideShowSpeed: val }))}
                      />
                    </div>
                  </Space>
                </Space>
              ),
            },
          ]}
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
