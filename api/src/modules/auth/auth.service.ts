import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { AppDataSource } from "../../db/data-source";
import { User } from "../users/user.entity";
import { env } from "../../config/env";
import { InvalidCredentialsError,AccountRejectedError,AccountBlockedError,AccountPendingError ,UsernameTakenError } from "../../shared/errors/appError";
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
  email: string,
  password: string,
  fullName: string,
  role: Role,
  division: "FMS" | "A&D"
) {
  const existing = await userRepo.findOne({
    where: [{ username }, { email }],
  });
  if (existing) {
    throw new UsernameTakenError(); // consider a more general "AccountAlreadyExistsError" name now
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

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

export async function login(email: string, password: string) {
  const user = await userRepo.findOne({ where: { email } });

  if (!user ) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }
  if (user.accountStatus === "Pending") throw new AccountPendingError();
  if (user.accountStatus === "Blocked") throw new AccountBlockedError();
  if (user.accountStatus === "Rejected") throw new AccountRejectedError();
  const token = issueToken({ userId: user.id, role: user.role as Role });

  return {
    token,
    user: { id: user.id, fullName: user.fullName, role: user.role as Role },
  };
}