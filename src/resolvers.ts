import { deleteCookie, setCookie } from "hono/cookie";
import { sighJWT } from "./jwt.js";
import type { Builder } from "./builder.js";
import type { Context } from "./context.js";

export const initResolvers = (builder: Builder) => {
  // Example of how to add a custom auth query
  builder.mutationType({
    fields: (t) => {
      return {
        // Example of how to add a custom auth query
        // This query will return true if the user is authenticated
        signIn: t.boolean({
          args: { email: t.arg({ type: "String", required: true }) },
          resolve: async (_root, { email }, ctx) => {
            const prisma = ctx.get("prisma");
            const { id, name, roles } = await prisma.user.findUniqueOrThrow({
              where: { email },
            });
            const secret = process.env.SECRET ?? "";
            const user: Context["user"] = { id, name, roles };
            const token = await sighJWT({ user: user }, secret);
            setCookie(ctx, "session", token, {
              path: "/",
              httpOnly: true,
              sameSite: "strict",
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            });
            return true;
          },
        }),
        // Example of how to add a custom auth query
        // and will clear the session cookie
        signOut: t.boolean({
          resolve: (_root, _args, ctx) => {
            deleteCookie(ctx, "session", {
              path: "/",
            });
            return true;
          },
        }),
        me: t.string({
          resolve: (_root, _args, ctx) => {
            return ctx.get("user")?.name;
          },
        }),
      };
    },
  });
  // Example of how to add a custom query
  builder.addModelFields("Post", {
    test: (t) =>
      t.string({
        resolve: (parent) => {
          return `Add-${parent.title}`;
        },
      }),
  });
  // Example of directive operation
  builder.addModelDirectives("Post", "limit", {
    include: ["findMany"],
    limit: 3,
  });
};
