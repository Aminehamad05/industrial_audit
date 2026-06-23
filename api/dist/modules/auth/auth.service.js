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
const data_source_1 = require("../../db/data-source");
const user_entity_1 = require("./user.entity");
const env_1 = require("../../config/env");
const appError_1 = require("../../shared/errors/appError");
const BCRYPT_ROUNDS = 12;
const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
function issueToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
async function register(username, email, password, fullName, role, division) {
    const existing = await userRepo.findOne({
        where: [{ username }, { email }],
    });
    if (existing) {
        throw new appError_1.UsernameTakenError(); // consider a more general "AccountAlreadyExistsError" name now
    }
    const passwordHash = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
    const user = userRepo.create({
        username,
        email,
        passwordHash,
        fullName,
        role,
        division,
        accountStatus: "Pending",
    });
    await userRepo.save(user);
    // No token returned - the account isn't usable yet.
    return {
        id: user.id,
        fullName: user.fullName,
        accountStatus: user.accountStatus,
    };
}
async function login(email, password) {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
        throw new appError_1.InvalidCredentialsError();
    }
    const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        throw new appError_1.InvalidCredentialsError();
    }
    if (user.accountStatus === "Pending")
        throw new appError_1.AccountPendingError();
    if (user.accountStatus === "Blocked")
        throw new appError_1.AccountBlockedError();
    if (user.accountStatus === "Rejected")
        throw new appError_1.AccountRejectedError();
    const token = issueToken({ userId: user.id, role: user.role });
    return {
        token,
        user: { id: user.id, fullName: user.fullName, role: user.role },
    };
}
