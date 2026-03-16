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
