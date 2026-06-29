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
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.aspnet_Users.findUnique({ where: { UserId: userId } });
}

export async function deleteUser(userId: string) {
  const user = await prisma.aspnet_Users.findUnique({ where: { UserId: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  await prisma.aspnet_Users.delete({ where: { UserId: userId } });
}
