export interface IReadableRepository<T> {
  getById(id: string): Promise<T | null>;
}

export interface ICreateableRepository<TCreate, TResult> {
  create(data: TCreate): Promise<TResult | undefined>;
}

export interface IUpdatableRepository<TUpdate, TResult> {
  update(id: string, data: TUpdate): Promise<TResult | undefined>;
}

export interface IDeletableRepository {
  delete(id: string): Promise<void>;
}
