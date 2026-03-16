"use client";

import { useState } from "react";
import { message } from "antd";

import { WelcomeScreen } from "./WelcomeScreen";
import { CameraCapture } from "./CameraCapture";
import { PhotoPreview } from "./PhotoPreview";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { PostFlowState } from "@/types";

interface PostFlowProps {
  eventId: string;
  eventName: string;
  eventSlug: string;
}

/**
 * State machine managing the guest photo upload flow:
 * WELCOME → CAPTURE → PREVIEW → UPLOADING → CAPTURE
 */
export function PostFlow({
  eventId,
  eventName,
  eventSlug,
}: PostFlowProps): React.ReactElement {
  const [hasVisited, setHasVisited] = useLocalStorage(
    `visited-${eventSlug}`,
    false
  );
  const [state, setState] = useState<PostFlowState>(
    hasVisited ? "CAPTURE" : "WELCOME"
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleConfirm = (): void => {
    setHasVisited(true);
    setState("CAPTURE");
  };

  const handlePhotosSelected = (files: File[]): void => {
    setSelectedFiles(files);
    setState("PREVIEW");
  };

  const handleBack = (): void => {
    setSelectedFiles([]);
    setState("CAPTURE");
  };

  const handleSubmit = async (caption: string): Promise<void> => {
    setUploading(true);
    setState("UPLOADING");

    try {
      // Step 1: Upload photos
      const formData = new FormData();
      formData.append("eventSlug", eventSlug);
      for (const file of selectedFiles) {
        formData.append("photos", file);
      }

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const { photos } = await uploadResponse.json();

      // Step 2: Create post with photo data (URLs + dimensions)
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreatePost($eventId: ID!, $caption: String, $photos: [PhotoInput!]!) {
              createPost(eventId: $eventId, caption: $caption, photos: $photos) {
                id
              }
            }
          `,
          variables: {
            eventId,
            caption: caption || null,
            photos,
          },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      message.success("Photo posted!");
      setSelectedFiles([]);
      setState("CAPTURE");
    } catch (error) {
      console.error("Failed to post:", error);
      message.error("Failed to post. Please try again.");
      setState("PREVIEW");
    } finally {
      setUploading(false);
    }
  };

  switch (state) {
    case "WELCOME":
      return (
        <WelcomeScreen eventName={eventName} onConfirm={handleConfirm} />
      );
    case "CAPTURE":
      return <CameraCapture onPhotosSelected={handlePhotosSelected} />;
    case "PREVIEW":
    case "UPLOADING":
      return (
        <PhotoPreview
          files={selectedFiles}
          loading={uploading}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      );
  }
}
