import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostFlow } from "@/components/post/PostFlow";
import { DEFAULT_EVENT_SETTINGS } from "@/types";
import type { EventSettings } from "@/types";

interface PostPageProps {
  params: { slug: string };
}

/**
 * Mobile guest upload page. Server component fetches event data,
 * then renders the client-side PostFlow state machine.
 */
export default async function PostPage({
  params,
}: PostPageProps): Promise<React.ReactElement> {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event) {
    notFound();
  }

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
    <PostFlow
      eventId={event.id}
      eventName={event.name}
      eventSlug={event.slug}
      settings={settings}
    />
  );
}
