"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./prisma");
const BCRYPT_ROUNDS = 12;
async function seedSuperAdmin() {
    const username = "admin";
    const email = "amine05@test.com";
    const plainPassword = "amine2005";
    const existing = await prisma_1.prisma.users.findUnique({ where: { username } });
    if (existing) {
        console.log("Super admin already exists, skipping.");
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(plainPassword, BCRYPT_ROUNDS);
    await prisma_1.prisma.users.create({
        data: {
            username,
            email,
            password_hash: passwordHash,
            full_name: "Super Administrator",
            role: "Administrator",
            account_status: "Active",
        },
    });
    console.log("Super admin created:");
    console.log(`  username: ${username}`);
    console.log(`  password: ${plainPassword}`);
    console.log(`  email: ${email}`);
    console.log("  CHANGE THIS PASSWORD after first login.");
}
seedSuperAdmin().catch((err) => {
    console.error("Failed to seed super admin:", err);
    process.exit(1);
});
