// src/modules/users/user.service.ts
import { AppDataSource } from '../../db/data-source';
import { User } from './user.entity';
import { AccountStatus, ACCOUNT_STATUSES } from '../../shared/types/auth';
import { AppError } from '../../shared/errors/appError';

const userRepo = AppDataSource.getRepository(User);

export async function listUsers(statusFilter?: string) {
  if (statusFilter && !ACCOUNT_STATUSES.includes(statusFilter as AccountStatus)) {
    throw new AppError(400, `Invalid status. Must be one of: ${ACCOUNT_STATUSES.join(', ')}`);
  }

  return userRepo.find({
    where: statusFilter ? { accountStatus: statusFilter as AccountStatus } : {},
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      accountStatus: true,
      createdAt: true,
    },
    order: { createdAt: 'DESC' },
  });
}

export async function getUserById(userId: string): Promise<User | null> {
  return userRepo.findOne({ where: { id: userId } });
}

async function transitionStatus(
  userId: string,
  allowedFromStatuses: AccountStatus[],
  toStatus: AccountStatus
) {
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (!allowedFromStatuses.includes(user.accountStatus)) {
    throw new AppError(409, `Cannot move user from '${user.accountStatus}' to '${toStatus}'`);
  }

  user.accountStatus = toStatus;
  await userRepo.save(user);
  return user;
}

export async function approveUser(userId: string) {
  return transitionStatus(userId, ['Pending'], 'Active');
}

export async function rejectUser(userId: string) {
  return transitionStatus(userId, ['Pending'], 'Rejected');
}

export async function blockUser(userId: string) {
  return transitionStatus(userId, ['Active'], 'Blocked');
}

export async function unblockUser(userId: string) {
  return transitionStatus(userId, ['Blocked'], 'Active');
}

export async function deleteUser(userId: string) {
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  await userRepo.remove(user);
}