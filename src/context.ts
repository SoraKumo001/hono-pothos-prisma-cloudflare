import type { prisma } from "./prisma";

export type Context = {
  prisma: typeof prisma;
  user?: { id: string; name: string; roles: string[] };
};
