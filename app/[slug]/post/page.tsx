import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostFlow } from "@/components/post/PostFlow";

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

  return (
    <PostFlow
      eventId={event.id}
      eventName={event.name}
      eventSlug={event.slug}
    />
  );
}
