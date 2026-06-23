import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./data-source";
import { User } from "../modules/auth/user.entity";

const BCRYPT_ROUNDS = 12;

async function seedSuperAdmin() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  const username = "admin";
  const email = "amine05@test.com";
  const plainPassword = "amine2005"; // change after first login

  const existing = await userRepo.findOne({ where: { username } });
  if (existing) {
    console.log("Super admin already exists, skipping.");
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

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

  await AppDataSource.destroy();
}

seedSuperAdmin().catch((err) => {
  console.error("Failed to seed super admin:", err);
  process.exit(1);
});