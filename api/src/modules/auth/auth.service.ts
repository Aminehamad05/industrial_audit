import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { AppDataSource } from "../../db/data-source";
import { User } from "./user.entity";
import { env } from "../../config/env";
import { InvalidCredentialsError, UsernameTakenError } from "../../shared/errors/appError";
import type { JwtPayload, Role } from "../../shared/types/auth";

const BCRYPT_ROUNDS = 12;

const userRepo = AppDataSource.getRepository(User);

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
  password: string,
  fullName: string,
  role: Role
) {
  const existing = await userRepo.findOne({ where: { username } });
  if (existing) {
    throw new UsernameTakenError();
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = userRepo.create({
    username,
    passwordHash,
    fullName,
    role,
  });
  await userRepo.save(user);

  const token = issueToken({ userId: user.id, role: user.role as Role });

  return {
    token,
    user: { id: user.id, fullName: user.fullName, role: user.role as Role },
  };
}

export async function login(username: string, password: string) {
  const user = await userRepo.findOne({ where: { username } });

  if (!user || !user.isActive) {
    // Dummy compare so "no such user" and "wrong password" take the
    // same amount of time - otherwise response timing leaks which
    // usernames exist.
    await bcrypt.compare(password, "$2b$12$invalidsaltinvalidsaltinvalidsal");
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  const token = issueToken({ userId: user.id, role: user.role as Role });

  return {
    token,
    user: { id: user.id, fullName: user.fullName, role: user.role as Role },
  };
}