import { graphqlServer } from "@hono/graphql-server";
import { explorer } from "apollo-explorer/html";
// import { generate } from "graphql-auto-query";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { getCookie } from "hono/cookie";
import { createBuilder } from "./builder.js";
import { verifyJWT } from "./jwt.js";
import { prisma } from "./prisma.js";
import { initResolvers } from "./resolvers.js";
import type { Context } from "./context.js";

const builder = createBuilder();
// Initialize the resolvers for the GraphQL schema
initResolvers(builder);
const schema = builder.toSchema({ sortSchema: false });

const app = new Hono<{ Variables: Context }>();
app.use(contextStorage());

// Apollo Explorer
app.get("/", (c) => {
  return c.html(
    explorer({
      initialState: {
        // Set up sample GraphQL operations
        // document: generate(schema, 1),
      },
      endpointUrl: "/",
      introspectionInterval: 5000,
    })
  );
});

// Perform the initial setup required for GraphQL processing
app.post(async (c, next) => {
  const secret = process.env.SECRET ?? "";
  const token = getCookie(c, "session");
  const user = await verifyJWT<Pick<Context, "user">>(token, secret).then(
    (v) => v?.user
  );
  c.set("user", user);
  c.set("prisma", prisma);
  await next();
});

// Pass the process to the GraphQL server
app.post("/", (...params) =>
  graphqlServer({
    schema: schema,
  })(...params)
);

export default app;
