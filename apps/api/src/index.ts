import { Elysia } from "elysia";
import type { User } from "@repo/shared";

export const app = new Elysia()
  .get("/users", (): User[] => [
    { id: "1", name: "Foo" },
    { id: "2", name: "Bar" }
  ])
  .listen(3001);

export type App = typeof app;

console.log(`🦊 API running at ${app.server?.hostname}:${app.server?.port}`);
