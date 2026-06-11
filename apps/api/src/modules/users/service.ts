import type { User } from "@repo/shared";
import { UserRepository, type UserParams } from "./repository";
import { NotFoundError } from "../../core/errors/error-types";
import type { PaginatedResult } from "../../core/pagination";

export class UserService {
  private readonly userRepository = new UserRepository();

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    return user;
  }

  async list(params: UserParams): Promise<PaginatedResult<User>> {
    return await this.userRepository.getPage(params);
  }
}
