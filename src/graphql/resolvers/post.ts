import { sanitizeCaption, cleanProfanity } from "@/lib/utils";
import type { GraphQLContext } from "../context";

/**
 * Resolvers for Post queries and mutations.
 */
export const postResolvers = {
  Query: {
    posts: async (
      _parent: unknown,
      args: { eventId: string; since?: string; limit?: number },
      context: GraphQLContext
    ) => {
      const where: { eventId: string; dateCreated?: { gte: Date } } = {
        eventId: args.eventId,
      };

      if (args.since) {
        where.dateCreated = { gte: new Date(args.since) };
      }

      return context.db.post.findMany({
        where,
        include: { photos: true },
        orderBy: { dateCreated: "desc" },
        take: args.limit ?? undefined,
      });
    },
  },

  Mutation: {
    createPost: async (
      _parent: unknown,
      args: {
        eventId: string;
        caption?: string;
        photos: { url: string; width: number; height: number }[];
      },
      context: GraphQLContext
    ) => {
      const caption = args.caption
        ? cleanProfanity(sanitizeCaption(args.caption))
        : null;

      return context.db.post.create({
        data: {
          eventId: args.eventId,
          caption,
          photos: {
            create: args.photos.map((photo, index) => ({
              url: photo.url,
              width: photo.width,
              height: photo.height,
              order: index,
            })),
          },
        },
        include: { photos: true },
      });
    },
  },

  Post: {
    event: async (
      parent: { eventId?: string; id: string },
      _args: unknown,
      context: GraphQLContext
    ) => {
      const post = await context.db.post.findUnique({
        where: { id: parent.id },
        include: { event: true },
      });
      return post?.event;
    },
    photos: async (
      parent: { id: string },
      _args: unknown,
      context: GraphQLContext
    ) => {
      return context.db.photo.findMany({
        where: { postId: parent.id },
        orderBy: { order: "asc" },
      });
    },
  },
};
