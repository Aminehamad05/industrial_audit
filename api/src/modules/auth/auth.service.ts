import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { InvalidCredentialsError, UsernameTakenError } from "../../shared/errors/appError";
import type { JwtPayload, Role } from "../../shared/types/auth";

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
        { LoweredUserName: username.toLowerCase() },
        { Email: email }
      ]
    },
  });

  if (existing) {
    throw new UsernameTakenError();
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.aspnet_Users.create({
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

export async function login(email: string, password: string) {
  const user = await prisma.aspnet_Users.findFirst({
    where: { Email: email },
  });

  if (!user || !user.passwordHash) {
    throw new InvalidCredentialsError();
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    throw new InvalidCredentialsError();
  }

  const token = issueToken({ userId: user.UserId, role: "Auditor" as Role });

  return {
    token,
    user: {
      id: user.UserId,
      fullName: user.Name || user.UserName || "",
      role: "Auditor" as Role,
    },
  };
}