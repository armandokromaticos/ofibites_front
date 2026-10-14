import { User, UserRole } from "./auth.types";

/** Detalle de usuario de `/users`: mismo `UserResponseDto` que `User`. */
export type UserDetail = User;

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}
