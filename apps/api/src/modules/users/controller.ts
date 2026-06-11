import type { UserRole } from "@repo/shared";
import { UserService } from "./service";

const userService = new UserService();

export const userController = {
  async getById({ params }: { params: { id: string } }) {
    return await userService.getById(params.id);
  },

  async list({
    query
  }: {
    query: {
      page?: number;
      limit?: number;
      role?: UserRole;
      search?: string;
      field?: "createdAt" | "updatedAt" | "name";
      order?: "asc" | "desc";
    };
  }) {
    const { page, limit, role, search, field, order } = query;

    return await userService.list({
      pagination: {
        page: page ?? 1,
        limit: limit ?? 20
      },
      filters: { role, search },
      sort: { field, order }
    });
  }
};
