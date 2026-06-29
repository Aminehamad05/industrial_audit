"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.register = register;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../db/prisma");
const env_1 = require("../../config/env");
const appError_1 = require("../../shared/errors/appError");
const BCRYPT_ROUNDS = 12;
function issueToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
async function register(username, email, password, fullName, role) {
    const existing = await prisma_1.prisma.aspnet_Users.findFirst({
        where: {
            OR: [
                { LoweredUserName: username.toLowerCase() },
                { Email: email }
            ]
        },
    });
    if (existing) {
        throw new appError_1.UsernameTakenError();
    }
    const passwordHash = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
    const user = await prisma_1.prisma.aspnet_Users.create({
        data: {
            UserName: username,
            LoweredUserName: username.toLowerCase(),
            Email: email,
            Name: fullName,
            passwordHash,
            IsAnonymous: false,
            LastActivityDate: new Date(),
        },
    });
    return {
        id: user.UserId,
        fullName: user.Name || "",
        role: role,
    };
}
async function login(email, password) {
    const user = await prisma_1.prisma.aspnet_Users.findFirst({
        where: { Email: email },
    });
    if (!user || !user.passwordHash) {
        throw new appError_1.InvalidCredentialsError();
    }
    const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordValid) {
        throw new appError_1.InvalidCredentialsError();
    }
    const token = issueToken({ userId: user.UserId, role: "Auditor" });
    return {
        token,
        user: {
            id: user.UserId,
            fullName: user.Name || user.UserName || "",
            role: "Auditor",
        },
    };
}
