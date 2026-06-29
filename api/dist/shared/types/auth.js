"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponseSchema = exports.jwtPayloadSchema = exports.loginRequestSchema = exports.registerRequestSchema = exports.ROLES = exports.ACCOUNT_STATUSES = void 0;
const zod_1 = require("zod");
exports.ACCOUNT_STATUSES = [
    "Pending",
    "Active",
    "Blocked",
    "Rejected",
];
exports.ROLES = [
    "Auditor",
    "Supervisor",
    "MaintenanceTechnician",
    "Administrator",
];
exports.registerRequestSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(64),
    password: zod_1.z.string().min(8).max(128),
    fullName: zod_1.z.string().min(2).max(128),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(exports.ROLES),
});
exports.loginRequestSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string().min(8).max(128),
});
exports.jwtPayloadSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    role: zod_1.z.enum(exports.ROLES),
});
exports.authResponseSchema = zod_1.z.object({
    token: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        fullName: zod_1.z.string(),
        role: zod_1.z.enum(exports.ROLES),
    }),
});
