import { z } from "zod";

export const ROLES = [
  "Auditor",
  "Supervisor",
  "MaintenanceTechnician",
  "Administrator",
] as const;

export type Role = (typeof ROLES)[number];

export const registerRequestSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(128),
  role: z.enum(ROLES),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  username: z.string().min(3).max(64),
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