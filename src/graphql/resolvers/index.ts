import { eventResolvers } from "./event";
import { postResolvers } from "./post";

/**
 * Merged resolvers from all domain modules.
 */
export const resolvers = {
  Query: {
    ...eventResolvers.Query,
    ...postResolvers.Query,
  },
  Mutation: {
    ...eventResolvers.Mutation,
    ...postResolvers.Mutation,
  },
  Event: {
    ...eventResolvers.Event,
  },
  Post: postResolvers.Post,
  DateTime: {
    __serialize(value: unknown): string | null {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === "string") {
        return value;
      }
      return null;
    },
  },
};
