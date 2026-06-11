import { Elysia } from "elysia";
import cors from "@elysia/cors";
import { errorHandler } from "./core/errors/error-handler";
import { userRoutes } from "./modules/users/routes";
import { productRoutes } from "./modules/products/routes";
import { auth } from "./modules/auth/auth";

export const app = new Elysia()
  .use(cors())
  .use(errorHandler)
  // mount OpenAPI
  .all("/api/auth/*", async ({ request }) => {
    return auth.handler(request);
  })
  .group("/api", (app) => app.use(userRoutes).use(productRoutes))
  .listen(3001);

export type App = typeof app;

console.log(`🦊 API running at ${app.server?.hostname}:${app.server?.port}`);
