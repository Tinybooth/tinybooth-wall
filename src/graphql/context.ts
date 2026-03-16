import type { PrismaClient } from "@prisma/client";

export interface GraphQLContext {
  db: PrismaClient;
}
