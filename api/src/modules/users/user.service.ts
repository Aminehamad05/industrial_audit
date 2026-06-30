import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors/appError';

export async function listUsers() {
  return prisma.aspnet_Users.findMany({
    select: {
      UserId: true,
      UserName: true,
      Email: true,
      Name: true,
      LastActivityDate: true,
      status: true,
    },
  });
}

export async function getUserById(userId: string) {
  const user = await prisma.aspnet_Users.findUnique({
    where: { UserId: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

async function ensureUserExists(userId: string) {
  const user = await prisma.aspnet_Users.findUnique({
    where: { UserId: userId },
  });

  const membership = await prisma.aspnet_Membership.findUnique({
    where: { UserId: userId },
  });

  if (!user || !membership) {
    throw new AppError(404, 'User not found');
  }

  return { user, membership };
}

export async function deleteUser(userId: string) {
  await ensureUserExists(userId);

  const [, updatedMembership] = await prisma.$transaction([
    prisma.aspnet_Users.update({
      where: { UserId: userId },
      data: { status: 'deleted' },
    }),
    prisma.aspnet_Membership.update({
      where: { UserId: userId },
      data: {
        IsApproved: false,
        IsLockedOut: true,
        LastLockoutDate: new Date(),
      },
    }),
  ]);

  return updatedMembership;
}

export async function acceptUser(userId: string) {
  await ensureUserExists(userId);

  const [, updatedMembership] = await prisma.$transaction([
    prisma.aspnet_Users.update({
      where: { UserId: userId },
      data: { status: 'approved' },
    }),
    prisma.aspnet_Membership.update({
      where: { UserId: userId },
      data: {
        IsApproved: true,
        IsLockedOut: false,
      },
    }),
  ]);

  return updatedMembership;
}

export async function blockUser(userId: string) {
  await ensureUserExists(userId);

  const [, updatedMembership] = await prisma.$transaction([
    prisma.aspnet_Users.update({
      where: { UserId: userId },
      data: { status: 'blocked' },
    }),
    prisma.aspnet_Membership.update({
      where: { UserId: userId },
      data: {
        IsApproved: false,
        IsLockedOut: true,
        LastLockoutDate: new Date(),
      },
    }),
  ]);

  return updatedMembership;
}