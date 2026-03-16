import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostFeed } from "@/components/posts/PostFeed";
import type { Post, Photo } from "@/types";

interface PostsPageProps {
  params: { slug: string };
}

/**
 * Event recap page — scrollable IG-style feed of all photos.
 */
export default async function PostsPage({
  params,
}: PostsPageProps): Promise<React.ReactElement> {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event) {
    notFound();
  }

  const rawPosts = await db.post.findMany({
    where: { eventId: event.id },
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
        width: ph.width,
        height: ph.height,
        order: ph.order,
        dateCreated: ph.dateCreated.toISOString(),
      })
    ),
  }));

  return <PostFeed eventName={event.name} posts={posts} />;
}
