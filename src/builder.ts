import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaUtils from "@pothos/plugin-prisma-utils";
import PothosPrismaGeneratorPlugin from "pothos-prisma-generator";
import { prismaDmmf } from "./generated/prisma-dmmf.js";
import { prisma } from "./prisma.js";
import type { Context } from "./context.js";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import type Hono from "hono";

/**
 * Create a new schema builder instance
 */
export const createBuilder = () => {
  return new SchemaBuilder<{
    Context: Hono.Context<{ Variables: Context }>;
    PrismaTypes: PrismaTypes; //Not used because it is generated automatically
    Prisma: typeof prisma;
  }>({
    plugins: [PrismaPlugin, PrismaUtils, PothosPrismaGeneratorPlugin],
    prisma: {
      client: prisma,
      dmmf: prismaDmmf,
    },
    pothosPrismaGenerator: {
      // Replace the following directives
      // /// @pothos-generator input {data:{author:{connect:{id:"%%USER%%"}}}}
      replace: { "%%USER%%": ({ context }) => context.get("user")?.id },

      // Set the following permissions
      /// @pothos-generator any {authority:["ROLE"]}
      authority: ({ context }) => context.get("user")?.roles ?? [],
    },
  });
};

export type Builder = ReturnType<typeof createBuilder>;
