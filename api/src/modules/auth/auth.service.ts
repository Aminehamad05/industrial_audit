import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { InvalidCredentialsError,AccountBlockedError,AccountPendingError,AccountRejectedError, UsernameTakenError,InvalidRoleError,EmailTakenError } from "../../shared/errors/appError";
import { ROLES, type JwtPayload, type Role } from "../../shared/types/auth";

const BCRYPT_ROUNDS = 12;

function issueToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export async function register(
  username: string,
  email: string,
  password: string,
  fullName: string,
  role: Role
) {
  const existing = await prisma.aspnet_Users.findFirst({
  where: {
    OR: [
      { Email: { equals: email.trim().toLowerCase() } },
      { UserName: { equals: username.trim().toLowerCase() } },
    ],
  },
});

  if (existing) {
  const emailTaken = existing.Email?.toLowerCase() === email.trim().toLowerCase();
  const usernameTaken = existing.UserName?.toLowerCase() === username.trim().toLowerCase();
  // throw appropriate error based on which matched
  if(emailTaken){
    throw new EmailTakenError()
  }throw new UsernameTakenError()
}

  // Application + Role must exist before we can attach a user to them.
  const application = await prisma.aspnet_Applications.findFirstOrThrow();

  const roleRecord = await prisma.aspnet_Roles.findFirst({
    where: {
      RoleName: role,
      ApplicationId: application.ApplicationId,
    },
  });

  if (!roleRecord) {
    throw new InvalidRoleError();
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Wrap all related inserts in a transaction so a partial user never gets created.
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.aspnet_Users.create({
      data: {
        ApplicationId: application.ApplicationId,
        UserName: username,
        LoweredUserName: username.toLowerCase(),
        Email: email,
        Name: fullName,
        passwordHash,
        status: "Pending",
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
        PasswordSalt: "n/a", // bcrypt embeds its own salt; this column is a legacy ASP.NET artifact
        Email: email,
        LoweredEmail: email.toLowerCase(),
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
    role: role,
    status: user.status,
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.aspnet_Users.findFirst({
    where: { Email: email },
    include: {
      aspnet_Membership: true,
      aspnet_UsersInRoles: {
        include: { aspnet_Roles: true },
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
  if (user.status === "Blocked") {
    throw new AccountBlockedError();
  }

  if (user.status === "Deleted") {
    throw new InvalidCredentialsError(); // don't reveal the account ever existed
  }
  if (user.status === "Pending") {
    throw new AccountPendingError();
  }
  const role = user.aspnet_UsersInRoles[0]?.aspnet_Roles?.RoleName;
  if (!role) {
    throw new InvalidRoleError();
  }
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
  const allowedRoles = ["ADMINISTRATOR", "AUDITOR", "SUPERVISOR"] as const;
  type Role = typeof allowedRoles[number];
  function isRole(role: string): role is Role {
    return allowedRoles.includes(role as Role);
  }
  const roleName = user.aspnet_UsersInRoles[0]?.aspnet_Roles?.RoleName;
   if (!roleName || !isRole(roleName)) {
    throw new InvalidRoleError();
  }

  const token = issueToken({ userId: user.UserId, role:roleName });
  return {
    token,
    user: {
      id: user.UserId,
      fullName: user.Name || user.UserName || "",
      role: role  as Role,
    },
  };
}