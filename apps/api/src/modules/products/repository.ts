import {
  db,
  schema,
  type NewProduct,
  type NewProductImage,
  type Product,
  type ProductImage,
  type UpdateProduct
} from "@repo/shared";
import type {
  ICreateableRepository,
  IDeletableRepository,
  IReadableRepository,
  IUpdatableRepository
} from "../../core/contracts";
import { and, asc, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import {
  normalizePagination,
  paginate,
  type PaginatedResult,
  type PaginationParams
} from "../../core/pagination";

export type ProductFilters = {
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ProductSortParams = {
  field?: "createdAt" | "updatedAt" | "price" | "name";
  order?: "asc" | "desc";
};

export type ProductParams = {
  pagination: PaginationParams;
  filters?: ProductFilters;
  sort?: ProductSortParams;
};

export class ProductRepository
  implements
    IReadableRepository<Product>,
    ICreateableRepository<NewProduct, Product>,
    IUpdatableRepository<UpdateProduct, Product>,
    IDeletableRepository
{
  async getById(id: string): Promise<Product | null> {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id));

    return product ?? null;
  }

  async create(data: NewProduct): Promise<Product | undefined> {
    const [product] = await db.insert(schema.products).values(data).returning();

    return product;
  }

  async update(id: string, data: UpdateProduct): Promise<Product | undefined> {
    const [product] = await db
      .update(schema.products)
      .set(data)
      .where(eq(schema.products.id, id))
      .returning();

    return product;
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  async getPage({
    pagination,
    filters,
    sort
  }: ProductParams): Promise<PaginatedResult<Product>> {
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
        .from(schema.products)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(schema.products).where(whereClause)
    ]);
    const total = countRows[0]?.total ?? 0;

    return paginate(rows, total, page, limit);
  }

  private createWhereClause(filters: ProductFilters) {
    const conditions = [];

    if (filters.sellerId) {
      conditions.push(eq(schema.products.sellerId, filters.sellerId));
    }
    // 0 is falsy
    if (filters.minPrice !== undefined && Number.isFinite(filters.minPrice)) {
      conditions.push(gte(schema.products.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) {
      conditions.push(lte(schema.products.price, filters.maxPrice.toString()));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(schema.products.name, `%${filters.search}%`),
          ilike(schema.products.description, `%${filters.search}%`)
        )
      );
    }

    return conditions;
  }

  private createOrderByClause(sort?: ProductSortParams) {
    const field = sort?.field ?? "createdAt";
    const order = sort?.order ?? "desc";

    const sortFunction = order === "asc" ? asc : desc;

    switch (field) {
      case "name":
        return sortFunction(schema.products.name);

      case "price":
        return sortFunction(schema.products.price);

      case "updatedAt":
        return sortFunction(schema.products.updatedAt);

      case "createdAt":
      default:
        return sortFunction(schema.products.createdAt);
    }
  }
}

export class ProductImagesRepository
  implements
    ICreateableRepository<NewProductImage, ProductImage>,
    IDeletableRepository
{
  async getById(id: string): Promise<ProductImage | null> {
    const [image] = await db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.id, id));

    return image ?? null;
  }

  async getByProduct(productId: string): Promise<ProductImage[]> {
    return await db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, productId))
      .orderBy(schema.productImages.order);
  }

  async create(data: NewProductImage): Promise<ProductImage | undefined> {
    const [image] = await db
      .insert(schema.productImages)
      .values(data)
      .returning();

    return image;
  }

  async createMany(data: NewProductImage[]): Promise<ProductImage[]> {
    return db.insert(schema.productImages).values(data);
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(schema.productImages)
      .where(eq(schema.productImages.id, id));
  }

  async deleteByProduct(productId: string): Promise<void> {
    await db
      .delete(schema.productImages)
      .where(eq(schema.productImages.productId, productId));
  }
}
