import { del } from "@vercel/blob";
import { generateSlug } from "@/lib/utils";
import { DEFAULT_EVENT_SETTINGS } from "@/types";
import type { GraphQLContext } from "../context";
import type { EventSettings } from "@/types";

/**
 * Merge stored settings (potentially partial/outdated) with defaults.
 * Ensures new settings fields always have a value for existing events.
 */
function mergeSettings(stored: unknown): EventSettings {
  const partial = (stored && typeof stored === "object" ? stored : {}) as Partial<EventSettings>;
  return {
    ...DEFAULT_EVENT_SETTINGS,
    ...partial,
    theme: {
      ...DEFAULT_EVENT_SETTINGS.theme,
      ...(partial.theme ?? {}),
    },
  };
}

/**
 * Resolvers for Event queries and mutations.
 */
export const eventResolvers = {
  Query: {
    event: async (
      _parent: unknown,
      args: { slug: string },
      context: GraphQLContext
    ) => {
      return context.db.event.findUnique({
        where: { slug: args.slug },
        include: { posts: { include: { photos: true } } },
      });
    },
    adminEventById: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      return context.db.event.findUnique({
        where: { id: args.id },
        include: { posts: { include: { photos: true } } },
      });
    },
    adminEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      return context.db.event.findMany({
        include: { posts: { include: { photos: true } } },
        orderBy: { dateCreated: "desc" },
      });
    },
  },

  Mutation: {
    createEvent: async (
      _parent: unknown,
      args: { name: string },
      context: GraphQLContext
    ) => {
      const slug = generateSlug(args.name);
      return context.db.event.create({
        data: {
          name: args.name,
          slug,
        },
        include: { posts: true },
      });
    },
    adminUpdateEvent: async (
      _parent: unknown,
      args: { id: string; name: string },
      context: GraphQLContext
    ) => {
      return context.db.event.update({
        where: { id: args.id },
        data: { name: args.name },
        include: { posts: { include: { photos: true } } },
      });
    },
    adminUpdateEventSettings: async (
      _parent: unknown,
      args: { id: string; settings: EventSettings },
      context: GraphQLContext
    ) => {
      return context.db.event.update({
        where: { id: args.id },
        data: { settings: JSON.parse(JSON.stringify(args.settings)) },
        include: { posts: { include: { photos: true } } },
      });
    },
    adminDeleteEvent: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const event = await context.db.event.findUnique({
        where: { id: args.id },
        include: { posts: { include: { photos: true } } },
      });

      // Delete blob assets
      const blobUrls = event?.posts.flatMap((p) => p.photos.map((ph) => ph.url)) ?? [];
      if (blobUrls.length > 0) {
        await del(blobUrls);
      }

      // Delete DB records
      const postIds = event?.posts.map((p) => p.id) ?? [];
      await context.db.photo.deleteMany({ where: { postId: { in: postIds } } });
      await context.db.post.deleteMany({ where: { eventId: args.id } });
      await context.db.event.delete({ where: { id: args.id } });

      return event;
    },
  },

  Event: {
    settings: (
      parent: { settings?: unknown },
    ): EventSettings => {
      return mergeSettings(parent.settings);
    },
    posts: async (
      parent: { id: string },
      _args: unknown,
      context: GraphQLContext
    ) => {
      return context.db.post.findMany({
        where: { eventId: parent.id },
        include: { photos: true },
        orderBy: { dateCreated: "desc" },
      });
    },
  },
};
