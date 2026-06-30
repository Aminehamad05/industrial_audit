import { email, z } from "zod";

export const ACCOUNT_STATUSES = [
  "Pending",
  "Active",
  "Blocked",
  "Rejected",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export const ROLES = [
  "ADMINISTRATOR",
  "AUDITOR",
  "SUPERVISOR",
] as const;

export type Role = (typeof ROLES)[number];
export const registerRequestSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(128),
  email: z.string().email(),
  role: z.enum(ROLES),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.string(),
  password: z.string().min(8).max(128),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLES),
});
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    role: z.enum(ROLES),
  }),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;