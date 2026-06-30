// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

type SeedUser = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: "ADMINISTRATOR" | "AUDITOR" | "SUPERVISOR";
};

const seedUsers: SeedUser[] = [
  { username: "alice.martin", email: "amine@test.com", password: "amine2005", fullName: "Amine Hamed", role: "ADMINISTRATOR" },
  { username: "bruno.lefevre", email: "bruno.lefevre@test-hutchinson.local", password: "Test1234!", fullName: "Bruno Lefevre", role: "ADMINISTRATOR" },
  { username: "claire.dubois", email: "claire.dubois@test-hutchinson.local", password: "Test1234!", fullName: "Claire Dubois", role: "AUDITOR" },
  { username: "david.petit", email: "david.petit@test-hutchinson.local", password: "Test1234!", fullName: "David Petit", role: "AUDITOR" },
  { username: "emma.rousseau", email: "emma.rousseau@test-hutchinson.local", password: "Test1234!", fullName: "Emma Rousseau", role: "SUPERVISOR" },
  { username: "farid.benali", email: "farid.benali@test-hutchinson.local", password: "Test1234!", fullName: "Farid Benali", role: "SUPERVISOR" },
];

async function main() {
  const application = await prisma.aspnet_Applications.findFirst({
    where: { LoweredApplicationName: "development" },
  });

  if (!application) {
    throw new Error('No "development" aspnet_Applications row found — run the application/role seed SQL first.');
  }

  for (const seedUser of seedUsers) {
    const existing = await prisma.aspnet_Users.findFirst({
      where: {
        OR: [
          { LoweredUserName: seedUser.username.toLowerCase() },
          { Email: seedUser.email },
        ],
      },
    });

    if (existing) {
      console.log(`Skipping ${seedUser.email} — already exists.`);
      continue;
    }

    const roleRecord = await prisma.aspnet_Roles.findFirst({
      where: {
        RoleName: seedUser.role,
        ApplicationId: application.ApplicationId,
      },
    });

    if (!roleRecord) {
      console.warn(`Role ${seedUser.role} not found for development app — skipping ${seedUser.email}.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(seedUser.password, BCRYPT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.aspnet_Users.create({
        data: {
          ApplicationId: application.ApplicationId,
          UserName: seedUser.username,
          LoweredUserName: seedUser.username.toLowerCase(),
          Email: seedUser.email,
          Name: seedUser.fullName,
          passwordHash,
          status: "Approved",
          IsAnonymous: false,
          LastActivityDate: new Date(),
        },
      });

      await tx.aspnet_Membership.create({
        data: {
          ApplicationId: application.ApplicationId,
          UserId: newUser.UserId,
          Password: passwordHash,
          PasswordFormat: 1,
          PasswordSalt: "n/a",
          Email: seedUser.email,
          LoweredEmail: seedUser.email.toLowerCase(),
          IsApproved: true,
          IsLockedOut: false,
          CreateDate: new Date(),
          LastLoginDate: new Date(),
          LastPasswordChangedDate: new Date(),
          LastLockoutDate: new Date(),
          FailedPasswordAttemptCount: 0,
          FailedPasswordAttemptWindowStart: new Date(),
          FailedPasswordAnswerAttemptCount: 0,
          FailedPasswordAnswerAttemptWindowStart: new Date(),
        },
      });

      await tx.aspnet_UsersInRoles.create({
        data: {
          UserId: newUser.UserId,
          RoleId: roleRecord.RoleId,
        },
      });
    });

    console.log(`Created ${seedUser.role} account: ${seedUser.email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });