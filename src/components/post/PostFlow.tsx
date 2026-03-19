"use client";

import { useState } from "react";
import { ConfigProvider, message } from "antd";
import { upload } from "@vercel/blob/client";

import { WelcomeScreen } from "./WelcomeScreen";
import { CameraCapture } from "./CameraCapture";
import { PhotoPreview } from "./PhotoPreview";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getMediaType, getVideoDimensions } from "@/lib/media";
import type { PostFlowState, MediaType, EventSettings } from "@/types";

interface PostFlowProps {
  eventId: string;
  eventName: string;
  eventSlug: string;
  settings: EventSettings;
}

/**
 * State machine managing the guest photo upload flow:
 * WELCOME → CAPTURE → PREVIEW → UPLOADING → CAPTURE
 */
export function PostFlow({
  eventId,
  eventName,
  eventSlug,
  settings,
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
    let filtered = files;

    // Filter out videos if not allowed
    if (!settings.allowVideo) {
      filtered = filtered.filter((f) => getMediaType(f) !== "video");
      if (filtered.length === 0) {
        message.error("Videos are not allowed for this event.");
        return;
      }
    }

    // Enforce max files per post
    if (filtered.length > settings.maxPhotosPerPost) {
      message.warning(`Maximum ${settings.maxPhotosPerPost} files per post. Only the first ${settings.maxPhotosPerPost} will be used.`);
      filtered = filtered.slice(0, settings.maxPhotosPerPost);
    }

    setSelectedFiles(filtered);
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
      // Partition files into images and videos
      const imageFiles: File[] = [];
      const videoFiles: File[] = [];
      for (const file of selectedFiles) {
        if (getMediaType(file) === "video") {
          videoFiles.push(file);
        } else {
          imageFiles.push(file);
        }
      }

      // Validate video sizes (100MB max per video)
      const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
      for (const video of videoFiles) {
        if (video.size > MAX_VIDEO_SIZE) {
          message.error(`Video "${video.name}" is too large. Maximum size is 100MB.`);
          setState("PREVIEW");
          setUploading(false);
          return;
        }
      }

      const allPhotos: { url: string; mediaType: MediaType; width: number; height: number }[] = [];

      // Upload images via existing /api/upload route (sharp processing)
      if (imageFiles.length > 0) {
        const formData = new FormData();
        formData.append("eventSlug", eventSlug);
        for (const file of imageFiles) {
          formData.append("photos", file);
        }

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed");
        }

        const { photos } = await uploadResponse.json();
        allPhotos.push(...photos);
      }

      // Upload videos directly to Vercel Blob via client-side upload
      for (const video of videoFiles) {
        const dimensions = await getVideoDimensions(video);
        const filename = `${eventSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${video.name}`;
        const blob = await upload(filename, video, {
          access: "public",
          handleUploadUrl: "/api/upload/token",
        });

        allPhotos.push({
          url: blob.url,
          mediaType: "video" as const,
          width: dimensions.width,
          height: dimensions.height,
        });
      }

      // Create post with all media (URLs + dimensions + mediaType)
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
            photos: allPhotos,
          },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      message.success("Posted!");
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

  const content = (() => {
    switch (state) {
      case "WELCOME":
        return (
          <WelcomeScreen eventName={eventName} onConfirm={handleConfirm} theme={settings.theme} />
        );
      case "CAPTURE":
        return (
          <CameraCapture
            onPhotosSelected={handlePhotosSelected}
            allowVideo={settings.allowVideo}
            allowChooseFromLibrary={settings.allowChooseFromLibrary}
            theme={settings.theme}
          />
        );
      case "PREVIEW":
      case "UPLOADING":
        return (
          <PhotoPreview
            files={selectedFiles}
            loading={uploading}
            onSubmit={handleSubmit}
            onBack={handleBack}
            allowCaptions={settings.allowCaptions}
            theme={settings.theme}
          />
        );
    }
  })();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: settings.theme.buttonColor } }}>
      {content}
    </ConfigProvider>
  );
}
