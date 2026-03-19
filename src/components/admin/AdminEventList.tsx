"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import type { Event } from "@/types";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { confirm } = Modal;

/**
 * Fetches all events from the admin GraphQL endpoint.
 */
async function fetchEvents(): Promise<Event[]> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query AdminEvents {
          adminEvents {
            id
            name
            slug
            dateCreated
            posts {
              id
              photos {
                id
              }
            }
          }
        }
      `,
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.adminEvents;
}

/**
 * Deletes an event by ID via the admin GraphQL endpoint.
 */
async function deleteEvent(id: string): Promise<void> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation AdminDeleteEvent($id: ID!) {
          adminDeleteEvent(id: $id) {
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
 * Admin page listing all events with post counts and management actions.
 */
export function AdminEventList(): React.ReactElement {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      message.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = useCallback(
    (event: Event): void => {
      const totalPhotos = event.posts.reduce(
        (sum, post) => sum + post.photos.length,
        0
      );

      confirm({
        title: `Delete "${event.name}"?`,
        icon: <ExclamationCircleOutlined />,
        content: `This will permanently delete the event, ${event.posts.length} post(s), and ${totalPhotos} photo(s).`,
        okText: "Delete",
        okType: "danger",
        onOk: async () => {
          try {
            await deleteEvent(event.id);
            message.success("Event deleted");
            loadEvents();
          } catch (error) {
            console.error("Failed to delete event:", error);
            message.error("Failed to delete event");
          }
        },
      });
    },
    [loadEvents]
  );

  const columns: ColumnsType<Event> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Event) => (
        <a onClick={() => router.push(`/admin/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => <Tag>{slug}</Tag>,
    },
    {
      title: "Posts",
      key: "posts",
      render: (_: unknown, record: Event) => record.posts.length,
      width: 80,
    },
    {
      title: "Photos",
      key: "photos",
      render: (_: unknown, record: Event) =>
        record.posts.reduce((sum, post) => sum + post.photos.length, 0),
      width: 80,
    },
    {
      title: "Created",
      dataIndex: "dateCreated",
      key: "dateCreated",
      render: (date: string) => new Date(date).toLocaleDateString(),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_: unknown, record: Event) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/admin/${record.id}`)}
          >
            Manage
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Events
        </Title>
        <Button type="primary" onClick={() => router.push("/")}>
          Create Event
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: "No events yet" }}
      />
    </div>
  );
}
