import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PhotoGrid } from "@/components/tv/PhotoGrid";
import { getTimeWindowCutoff } from "@/lib/utils";
import { DEFAULT_EVENT_SETTINGS } from "@/types";
import type { Post, Photo, EventSettings } from "@/types";

interface TVPageProps {
  params: { slug: string };
}

/**
 * TV display page — full-viewport photo collage with QR code.
 * Server component that fetches initial data, then hands off to client for polling.
 */
export default async function TVPage({
  params,
}: TVPageProps): Promise<React.ReactElement> {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event) {
    notFound();
  }

  const totalCount = await db.post.count({
    where: { eventId: event.id },
  });

  const since = totalCount >= 100 ? getTimeWindowCutoff() : undefined;

  const rawPosts = await db.post.findMany({
    where: {
      eventId: event.id,
      ...(since ? { dateCreated: { gte: since } } : {}),
    },
    include: { photos: true },
    orderBy: { dateCreated: "desc" },
  });

  const posts: Post[] = rawPosts.map((p) => ({
    id: p.id,
    caption: p.caption,
    dateCreated: p.dateCreated.toISOString(),
    photos: p.photos.map(
      (ph): Photo => ({
        id: ph.id,
        url: ph.url,
        mediaType: (ph.mediaType as Photo["mediaType"]) ?? "image",
        width: ph.width,
        height: ph.height,
        order: ph.order,
        dateCreated: ph.dateCreated.toISOString(),
      })
    ),
  }));

  const stored = (event.settings && typeof event.settings === "object" ? event.settings : {}) as Partial<EventSettings>;
  const settings: EventSettings = {
    ...DEFAULT_EVENT_SETTINGS,
    ...stored,
    theme: {
      ...DEFAULT_EVENT_SETTINGS.theme,
      ...(stored.theme ?? {}),
    },
  };

  return (
    <PhotoGrid
      eventId={event.id}
      eventName={event.name}
      eventSlug={event.slug}
      initialPosts={posts}
      settings={settings}
    />
  );
}
