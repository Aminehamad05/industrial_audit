import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import {
  InvalidCredentialsError,
  AccountBlockedError,
  AccountPendingError,
  UsernameTakenError,
  InvalidRoleError,
  EmailTakenError,
  InvalidPlantError,
  MissingMentorNameError
} from "../../shared/errors/appError";
import { type JwtPayload, type Role } from "../../shared/types/auth";

const BCRYPT_ROUNDS = 12;

/* ----------------------------- TOKEN ----------------------------- */

function issueToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
}

export async function findUserById(userId: string) {
  return prisma.aspnet_Users.findUnique({
    where: { UserId: userId },
    select: { UserId: true, Name: true, UserName: true, Email: true, status: true },
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

/* ----------------------------- REGISTER ----------------------------- */

export async function register(
  username: string,
  email: string,
  password: string,
  fullName: string,
  role: Role,
  Plant: string,
  mentorName?: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPlant = Plant.trim();

  /* ---------------- CHECK EXISTING USER ---------------- */

  const existing = await prisma.aspnet_Users.findFirst({
    where: {
      OR: [
        { Email: normalizedEmail },
        { LoweredUserName: normalizedUsername },
      ],
    },
  });

  if (existing) {
    if (existing.Email?.toLowerCase() === normalizedEmail) {
      throw new EmailTakenError();
    }
    throw new UsernameTakenError();
  }

  /* ---------------- APPLICATION ---------------- */

  const application = await prisma.aspnet_Applications.findFirstOrThrow();

  /* ---------------- ROLE ---------------- */

  const roleRecord = await prisma.aspnet_Roles.findFirst({
    where: {
      RoleName: role,
      ApplicationId: application.ApplicationId,
    },
  });

  if (!roleRecord) {
    throw new InvalidRoleError();
  }

  /* ---------------- PASSWORD HASH ---------------- */

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  /* ---------------- TRANSACTION ---------------- */

  const user = await prisma.$transaction(async (tx) => {
    /* -------- PLANT -------- */

    const plant = await tx.plant.findFirst({
      where: {
        designationPlant: normalizedPlant,
      },
    });

    if (!plant) {
      throw new InvalidPlantError();
    }

    /* -------- CREATE USER -------- */

    const newUser = await tx.aspnet_Users.create({
      data: {
        ApplicationId: application.ApplicationId,
        UserName: username.trim(),
        LoweredUserName: normalizedUsername,
        Email: email.trim(),
        Name: fullName,
        passwordHash,
        status: "Pending",
        IsAnonymous: false,
        LastActivityDate: new Date(),
      },
    });

    /* -------- AUDITOR LINK -------- */

    if (role === "AUDITOR") {
      if (!mentorName) {
        throw new MissingMentorNameError();
      }

      const supervisor = await tx.aspnet_Users.findFirstOrThrow({
        where: {
          Name: mentorName,
        },
      });

      await tx.affectationUserUserChef.create({
        data: {
          UserId: newUser.UserId,
          UserIdSup: supervisor.UserId,
          idPlant:plant.idPlant
      }});
    }

    /* -------- MEMBERSHIP -------- */

    await tx.aspnet_Membership.create({
      data: {
        ApplicationId: application.ApplicationId,
        UserId: newUser.UserId,
        Password: passwordHash,
        PasswordFormat: 1,
        PasswordSalt: "n/a",
        Email: email.trim(),
        LoweredEmail: normalizedEmail,
        IsApproved: false,
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

    /* -------- ROLE LINK -------- */

    await tx.aspnet_UsersInRoles.create({
      data: {
        UserId: newUser.UserId,
        RoleId: roleRecord.RoleId,
      },
    });

    return newUser;
  });

  return {
    id: user.UserId,
    fullName: user.Name || "",
    role,
    status: user.status,
  };
}

/* ----------------------------- LOGIN ----------------------------- */

export async function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.aspnet_Users.findFirst({
    where: {
      Email: normalizedEmail,
    },
    include: {
      aspnet_Membership: true,
      aspnet_UsersInRoles: {
        include: {
          aspnet_Roles: true,
        },
      },
    },
  });

  if (!user || !user.passwordHash) {
    throw new InvalidCredentialsError();
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    throw new InvalidCredentialsError();
  }

  /* ---------------- STATUS CHECK ---------------- */

  if (user.status === "Blocked") {
    throw new AccountBlockedError();
  }

  if (user.status === "Deleted") {
    throw new InvalidCredentialsError();
  }

  if (user.status === "Pending") {
    throw new AccountPendingError();
  }

  /* ---------------- ROLE ---------------- */

  const roleName = user.aspnet_UsersInRoles[0]?.aspnet_Roles?.RoleName;

  if (!roleName) {
    throw new InvalidRoleError();
  }

  /* ---------------- UPDATE ACTIVITY ---------------- */

  await prisma.aspnet_Users.update({
    where: { UserId: user.UserId },
    data: { LastActivityDate: new Date() },
  });

  if (user.aspnet_Membership) {
    await prisma.aspnet_Membership.update({
      where: { UserId: user.UserId },
      data: { LastLoginDate: new Date() },
    });
  }

  /* ---------------- TOKEN ---------------- */

  const token = issueToken({
    userId: user.UserId,
    role: roleName as Role,
  });

  return {
    token,
    user: {
      id: user.UserId,
      fullName: user.Name || user.UserName || "",
      username: user.UserName,
      role: roleName,
    },
  };
}