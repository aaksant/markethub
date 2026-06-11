import {
  db,
  roleEnum,
  schema,
  users,
  type User,
  type UserRole
} from "@repo/shared";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import type { IReadableRepository } from "../../core/contracts";
import {
  normalizePagination,
  paginate,
  type PaginatedResult,
  type PaginationParams
} from "../../core/pagination";

export type UserFilters = {
  role?: UserRole;
  search?: string;
};

export type UserSortParams = {
  field?: "createdAt" | "updatedAt" | "name";
  order?: "asc" | "desc";
};

export type UserParams = {
  pagination: PaginationParams;
  filters?: UserFilters;
  sort?: UserSortParams;
};

export class UserRepository implements IReadableRepository<User> {
  async getById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user ?? null;
  }

  async getPage({
    pagination,
    filters,
    sort
  }: UserParams): Promise<PaginatedResult<User>> {
    const { page, limit, offset } = normalizePagination(pagination);

    const rawWhere = this.createWhereClause(filters || {});
    const whereClause = rawWhere.length !== 0 ? and(...rawWhere) : undefined;
    const orderByClause = this.createOrderByClause(
      sort || {
        field: "createdAt",
        order: "desc"
      }
    );

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(schema.users)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(schema.users).where(whereClause)
    ]);
    const total = countRows[0]?.total ?? 0;

    return paginate(rows, total, page, limit);
  }

  private createOrderByClause(sort?: UserSortParams) {
    const field = sort?.field ?? "createdAt";
    const order = sort?.order ?? "desc";

    const sortFunction = order === "asc" ? asc : desc;

    switch (field) {
      case "name":
        return sortFunction(schema.users.name);
      case "createdAt":
        return sortFunction(schema.users.createdAt);
      case "updatedAt":
        return sortFunction(schema.users.updatedAt);
      default:
        return sortFunction(schema.users.createdAt);
    }
  }

  private createWhereClause(filters: UserFilters) {
    const conditions = [];

    if (filters.role) {
      conditions.push(eq(schema.users.role, filters.role));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(schema.users.name, `%${filters.search}`),
          ilike(schema.users.email, `%${filters.search}`)
        )
      );
    }

    return conditions;
  }
}
