"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Space,
  Card,
  Input,
  InputNumber,
  Table,
  Image,
  Modal,
  Tag,
  Switch,
  ColorPicker,
  Slider,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { DEFAULT_EVENT_SETTINGS } from "@/types";
import type { Event, Post, Photo, EventSettings } from "@/types";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface AdminEventDetailProps {
  eventId: string;
}

/**
 * Fetches a single event by ID from the admin GraphQL endpoint.
 */
async function fetchEvent(id: string): Promise<Event | null> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query AdminEventById($id: ID!) {
          adminEventById(id: $id) {
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
              caption
              dateCreated
              photos {
                id
                url
                mediaType
                width
                height
                order
              }
            }
          }
        }
      `,
      variables: { id },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.adminEventById;
}

/**
 * Updates an event name via the admin GraphQL endpoint.
 */
async function updateEventName(id: string, name: string): Promise<Event> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation AdminUpdateEvent($id: ID!, $name: String!) {
          adminUpdateEvent(id: $id, name: $name) {
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
              caption
              dateCreated
              photos {
                id
                url
                mediaType
                width
                height
                order
              }
            }
          }
        }
      `,
      variables: { id, name },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.adminUpdateEvent;
}

/**
 * Updates event settings via the admin GraphQL endpoint.
 */
async function updateEventSettings(id: string, settings: EventSettings): Promise<Event> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation AdminUpdateEventSettings($id: ID!, $settings: EventSettingsInput!) {
          adminUpdateEventSettings(id: $id, settings: $settings) {
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
              caption
              dateCreated
              photos {
                id
                url
                mediaType
                width
                height
                order
              }
            }
          }
        }
      `,
      variables: { id, settings },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.adminUpdateEventSettings;
}

/**
 * Updates a post caption via the admin GraphQL endpoint.
 */
async function updatePostCaption(id: string, caption: string | null): Promise<void> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation AdminUpdatePost($id: ID!, $caption: String) {
          adminUpdatePost(id: $id, caption: $caption) {
            id
          }
        }
      `,
      variables: { id, caption },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
}

/**
 * Deletes a post via the admin GraphQL endpoint.
 */
async function deletePost(id: string): Promise<void> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation AdminDeletePost($id: ID!) {
          adminDeletePost(id: $id) {
            id
          }
        }
      `,
      variables: { id },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
}

/**
 * Admin detail page for a single event, showing event info and a CRUD table of posts.
 */
export function AdminEventDetail({ eventId }: AdminEventDetailProps): React.ReactElement {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");
  const [settingsValue, setSettingsValue] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadEvent = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchEvent(eventId);
      setEvent(data);
      if (data) {
        setNameValue(data.name);
        setSettingsValue(data.settings ?? DEFAULT_EVENT_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
      message.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleSaveName = useCallback(async (): Promise<void> => {
    if (!nameValue.trim() || !event) return;

    setSavingName(true);
    try {
      const updated = await updateEventName(event.id, nameValue.trim());
      setEvent(updated);
      setEditingName(false);
      message.success("Event name updated");
    } catch (error) {
      console.error("Failed to update event:", error);
      message.error("Failed to update event name");
    } finally {
      setSavingName(false);
    }
  }, [event, nameValue]);

  const handleSaveSettings = useCallback(async (): Promise<void> => {
    if (!event) return;
    setSavingSettings(true);
    try {
      const updated = await updateEventSettings(event.id, settingsValue);
      setEvent(updated);
      message.success("Settings saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
      message.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }, [event, settingsValue]);

  const handleEditCaption = useCallback((post: Post): void => {
    setEditingPostId(post.id);
    setCaptionValue(post.caption ?? "");
  }, []);

  const handleSaveCaption = useCallback(async (): Promise<void> => {
    if (!editingPostId) return;

    try {
      await updatePostCaption(editingPostId, captionValue || null);
      setEditingPostId(null);
      message.success("Caption updated");
      loadEvent();
    } catch (error) {
      console.error("Failed to update caption:", error);
      message.error("Failed to update caption");
    }
  }, [editingPostId, captionValue, loadEvent]);

  const handleDeletePost = useCallback(
    (post: Post): void => {
      confirm({
        title: "Delete this post?",
        icon: <ExclamationCircleOutlined />,
        content: `This will permanently delete the post and its ${post.photos.length} photo(s).`,
        okText: "Delete",
        okType: "danger",
        onOk: async () => {
          try {
            await deletePost(post.id);
            message.success("Post deleted");
            loadEvent();
          } catch (error) {
            console.error("Failed to delete post:", error);
            message.error("Failed to delete post");
          }
        },
      });
    },
    [loadEvent]
  );

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <Title level={2}>Loading...</Title>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <Title level={2}>Event not found</Title>
        <Button onClick={() => router.push("/admin")}>Back to Events</Button>
      </div>
    );
  }

  const totalPhotos = event.posts.reduce(
    (sum, post) => sum + post.photos.length,
    0
  );

  const columns: ColumnsType<Post> = [
    {
      title: "Photos",
      key: "photos",
      width: 200,
      render: (_: unknown, record: Post) => (
        <Image.PreviewGroup>
          <Space size={4} wrap>
            {record.photos.map((photo: Photo) =>
              photo.mediaType === "video" ? (
                <video
                  key={photo.id}
                  src={photo.url}
                  muted
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              ) : (
                <Image
                  key={photo.id}
                  src={photo.url}
                  alt=""
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              )
            )}
          </Space>
        </Image.PreviewGroup>
      ),
    },
    {
      title: "Caption",
      dataIndex: "caption",
      key: "caption",
      render: (caption: string | null, record: Post) => {
        if (editingPostId === record.id) {
          return (
            <Space>
              <Input
                size="small"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onPressEnter={handleSaveCaption}
                maxLength={100}
                style={{ width: 200 }}
                placeholder="Caption (optional)"
              />
              <Button
                size="small"
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveCaption}
              />
              <Button
                size="small"
                onClick={() => setEditingPostId(null)}
              >
                Cancel
              </Button>
            </Space>
          );
        }

        return (
          <Space>
            <Text>{caption || <Text type="secondary">No caption</Text>}</Text>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCaption(record)}
            />
          </Space>
        );
      },
    },
    {
      title: "Photos",
      key: "photoCount",
      width: 80,
      render: (_: unknown, record: Post) => record.photos.length,
    },
    {
      title: "Posted",
      dataIndex: "dateCreated",
      key: "dateCreated",
      width: 160,
      render: (date: string) =>
        new Date(date).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, record: Post) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeletePost(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/admin")}
        style={{ marginBottom: 16 }}
      >
        Back to Events
      </Button>

      <Card
        style={{
          background: "#141414",
          border: "1px solid #303030",
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text type="secondary">Event Name</Text>
            {editingName ? (
              <Space style={{ marginTop: 4 }}>
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onPressEnter={handleSaveName}
                  maxLength={100}
                  style={{ width: 300 }}
                />
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={savingName}
                  onClick={handleSaveName}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditingName(false);
                    setNameValue(event.name);
                  }}
                >
                  Cancel
                </Button>
              </Space>
            ) : (
              <Space style={{ marginTop: 4 }}>
                <Title level={3} style={{ margin: 0 }}>
                  {event.name}
                </Title>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setEditingName(true)}
                />
              </Space>
            )}
          </div>

          <Space size="large">
            <div>
              <Text type="secondary">Slug: </Text>
              <Tag>{event.slug}</Tag>
            </div>
            <div>
              <Text type="secondary">Posts: </Text>
              <Text>{event.posts.length}</Text>
            </div>
            <div>
              <Text type="secondary">Photos: </Text>
              <Text>{totalPhotos}</Text>
            </div>
            <div>
              <Text type="secondary">Created: </Text>
              <Text>{new Date(event.dateCreated).toLocaleDateString()}</Text>
            </div>
          </Space>
        </Space>
      </Card>

      <Card
        title="Event Settings"
        style={{
          background: "#141414",
          border: "1px solid #303030",
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Theme */}
          <div>
            <Text strong style={{ display: "block", marginBottom: 12 }}>Theme</Text>
            <Space size="large" wrap>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Button</Text>
                <ColorPicker
                  value={settingsValue.theme.buttonColor}
                  onChange={(_, hex) =>
                    setSettingsValue((s) => ({ ...s, theme: { ...s.theme, buttonColor: hex } }))
                  }
                />
              </div>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Secondary Button</Text>
                <ColorPicker
                  value={settingsValue.theme.secondaryButtonColor}
                  onChange={(_, hex) =>
                    setSettingsValue((s) => ({ ...s, theme: { ...s.theme, secondaryButtonColor: hex } }))
                  }
                />
              </div>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Text</Text>
                <ColorPicker
                  value={settingsValue.theme.textColor}
                  onChange={(_, hex) =>
                    setSettingsValue((s) => ({ ...s, theme: { ...s.theme, textColor: hex } }))
                  }
                />
              </div>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Subtext</Text>
                <ColorPicker
                  value={settingsValue.theme.subtextColor}
                  onChange={(_, hex) =>
                    setSettingsValue((s) => ({ ...s, theme: { ...s.theme, subtextColor: hex } }))
                  }
                />
              </div>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Background</Text>
                <ColorPicker
                  value={settingsValue.theme.backgroundColor}
                  onChange={(_, hex) =>
                    setSettingsValue((s) => ({ ...s, theme: { ...s.theme, backgroundColor: hex } }))
                  }
                />
              </div>
            </Space>
          </div>

          {/* Toggles */}
          <Space size="large" wrap>
            <div>
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Allow Library Uploads</Text>
              <Switch
                checked={settingsValue.allowChooseFromLibrary}
                onChange={(checked) => setSettingsValue((s) => ({ ...s, allowChooseFromLibrary: checked }))}
              />
            </div>
            <div>
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Allow Video</Text>
              <Switch
                checked={settingsValue.allowVideo}
                onChange={(checked) => setSettingsValue((s) => ({ ...s, allowVideo: checked }))}
              />
            </div>
            <div>
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Allow Captions</Text>
              <Switch
                checked={settingsValue.allowCaptions}
                onChange={(checked) => setSettingsValue((s) => ({ ...s, allowCaptions: checked }))}
              />
            </div>
          </Space>

          {/* Numeric settings */}
          <Space size="large" wrap>
            <div>
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>Max Photos Per Post</Text>
              <InputNumber
                min={1}
                max={20}
                value={settingsValue.maxPhotosPerPost}
                onChange={(val) => setSettingsValue((s) => ({ ...s, maxPhotosPerPost: val ?? 10 }))}
              />
            </div>
            <div style={{ minWidth: 200 }}>
              <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                Slideshow Speed: {settingsValue.slideShowSpeed}s
              </Text>
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={settingsValue.slideShowSpeed}
                onChange={(val) => setSettingsValue((s) => ({ ...s, slideShowSpeed: val }))}
              />
            </div>
          </Space>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={savingSettings}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Space>
      </Card>

      <Title level={4} style={{ marginBottom: 16 }}>
        Posts ({event.posts.length})
      </Title>

      <Table
        columns={columns}
        dataSource={event.posts}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: "No posts yet" }}
      />
    </div>
  );
}
