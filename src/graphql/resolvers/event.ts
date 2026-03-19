import { generateSlug } from "@/lib/utils";
import type { GraphQLContext } from "../context";

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
    adminDeleteEvent: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const event = await context.db.event.findUnique({
        where: { id: args.id },
        include: { posts: { include: { photos: true } } },
      });

      const postIds = event?.posts.map((p) => p.id) ?? [];
      await context.db.photo.deleteMany({ where: { postId: { in: postIds } } });
      await context.db.post.deleteMany({ where: { eventId: args.id } });
      await context.db.event.delete({ where: { id: args.id } });

      return event;
    },
  },

  Event: {
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
