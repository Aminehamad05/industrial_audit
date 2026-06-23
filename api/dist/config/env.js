"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
require("dotenv/config");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(4000),
    DB_HOST: zod_1.z.string().min(1),
    DB_PORT: zod_1.z.coerce.number().default(1433),
    DB_USER: zod_1.z.string().min(1),
    DB_PASSWORD: zod_1.z.string().min(1),
    DB_NAME: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: zod_1.z.string().default("8h"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment configuration:");
    console.error(parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
