import { Elysia } from "elysia";
import { auth } from "./modules/auth/auth";

export const app = new Elysia()
  .all("/api/auth/*", async ({ request }) => {
    return auth.handler(request);
  })
  .listen(3001);

export type App = typeof app;

console.log(`🦊 API running at ${app.server?.hostname}:${app.server?.port}`);
