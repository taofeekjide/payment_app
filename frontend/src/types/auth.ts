export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
  status?: "active" | "suspended";
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
};
