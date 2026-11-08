import { apiRequest } from "./api";
import type { AuthUser, LoginCredentials, RegisterData } from "../types/auth";

type ApiUser = {
  id: string;
  full_name?: string;
  fullName?: string;
  email: string;
  role: "customer" | "admin";
  status?: "active" | "suspended";
};

type AuthPayload = {
  user?: ApiUser;
  data?: ApiUser;
} & Partial<ApiUser>;

function normalizeUser(payload: AuthPayload): AuthUser {
  const user = payload.user ?? payload.data ?? payload;

  if (!user.id || !user.email) {
    throw new Error("The server returned an invalid user response.");
  }

  return {
    id: user.id,
    fullName: user.fullName ?? user.full_name ?? "",
    email: user.email,
    role: user.role ?? "customer",
    status: user.status,
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await apiRequest<AuthPayload>("/auth/register", {
      method: "POST",
      body: data,
    });

    return normalizeUser(response);
  },

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await apiRequest<AuthPayload>("/auth/login", {
      method: "POST",
      body: credentials,
    });

    return normalizeUser(response);
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiRequest<AuthPayload>("/auth/me");
    return normalizeUser(response);
  },

  async logout(): Promise<void> {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  },
};
