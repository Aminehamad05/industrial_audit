"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const data_source_1 = require("./data-source");
const user_entity_1 = require("../modules/auth/user.entity");
const BCRYPT_ROUNDS = 12;
async function seedSuperAdmin() {
    await data_source_1.AppDataSource.initialize();
    const userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const username = "admin";
    const email = "amine05@test.com";
    const plainPassword = "amine2005"; // change after first login
    const existing = await userRepo.findOne({ where: { username } });
    if (existing) {
        console.log("Super admin already exists, skipping.");
        await data_source_1.AppDataSource.destroy();
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(plainPassword, BCRYPT_ROUNDS);
    const superAdmin = userRepo.create({
        username,
        email,
        passwordHash,
        fullName: "Super Administrator",
        role: "Administrator",
        division: "FMS",
        accountStatus: "Active", // pre-approved - this is the one account that skips the Pending workflow entirely
    });
    await userRepo.save(superAdmin);
    console.log("Super admin created:");
    console.log(`  username: ${username}`);
    console.log(`  password: ${plainPassword}`);
    console.log(`  email: ${email}`);
    console.log("  CHANGE THIS PASSWORD after first login.");
    await data_source_1.AppDataSource.destroy();
}
seedSuperAdmin().catch((err) => {
    console.error("Failed to seed super admin:", err);
    process.exit(1);
});
