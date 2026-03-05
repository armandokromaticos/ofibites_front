import {
  CreateUserRequest,
  UpdateUserRequest,
  UserDetail,
} from "@/domain/types";
import { authFetcher } from "@/shared/utils/fetch";

export const userService = {
  getAll: (): Promise<UserDetail[]> =>
    authFetcher<UserDetail[]>("/users"),

  getById: (id: string): Promise<UserDetail> =>
    authFetcher<UserDetail>(`/users/${id}`),

  create: (data: CreateUserRequest): Promise<UserDetail> =>
    authFetcher<UserDetail>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateUserRequest): Promise<UserDetail> =>
    authFetcher<UserDetail>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    authFetcher<void>(`/users/${id}`, {
      method: "DELETE",
    }),
};
