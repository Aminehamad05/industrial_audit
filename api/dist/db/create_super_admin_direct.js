"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./prisma");
const BCRYPT_ROUNDS = 12;
async function createSuperAdminDirect() {
    const email = "amine@test.com";
    const username = "amine";
    const plainPassword = "amine2005";
    const fullName = "Super Administrator";
    const role = "Administrator";
    const accountStatus = "Active";
    const existing = await prisma_1.prisma.users.findUnique({ where: { email } });
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
            full_name: fullName,
            role,
            account_status: accountStatus,
        },
    });
    console.log("Super admin created:");
    console.log(`  username: ${username}`);
    console.log(`  password: ${plainPassword}`);
    console.log(`  email: ${email}`);
}
createSuperAdminDirect().catch((err) => {
    console.error("Failed to create super admin:", err);
    process.exit(1);
});
