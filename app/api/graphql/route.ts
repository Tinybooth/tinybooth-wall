import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resolvers } from "@/graphql/resolvers";
import type { GraphQLContext } from "@/graphql/context";

const typeDefs = readFileSync(
  join(process.cwd(), "src/graphql/schema.graphql"),
  "utf-8"
);

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async (): Promise<GraphQLContext> => ({
      db,
    }),
  }
);

/**
 * GraphQL API route handler. Supports both GET (playground) and POST (queries/mutations).
 */
export async function GET(request: NextRequest): Promise<Response> {
  return handler(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handler(request);
}
