import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getContext } from "hono/context-storage";

const getAdapter = (datasourceUrl: string) => {
  const url = new URL(datasourceUrl);
  const schema = url.searchParams.get("schema") ?? undefined;
  return new PrismaPg({ connectionString: datasourceUrl }, { schema });
};

export const prisma: PrismaClient = new Proxy<PrismaClient>({} as never, {
  get(_target: unknown, props: keyof PrismaClient) {
    const context = getContext<{
      Variables: { _prisma: PrismaClient };
      Bindings: { database: { connectionString: string } };
    }>();

    if (!context.get("_prisma")) {
      const datasourceUrl =
        process.env.DATABASE_URL ?? context.env.database?.connectionString;
      if (!datasourceUrl) throw new Error("DATABASE_URL is not set");
      const adapter = getAdapter(datasourceUrl);
      const prisma = new PrismaClient({
        adapter,
        log: ["error"],
      });
      context.set("_prisma", prisma);
    }
    return context.get("_prisma")[props];
  },
});
