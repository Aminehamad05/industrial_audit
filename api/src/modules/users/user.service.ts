import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors/appError';

export async function listUsers(statusFilter?: string) {
  const where: any = {};
  if (statusFilter) {
    const f = statusFilter.toLowerCase();
    if (f === 'active' || f === 'approved') {
      where.status = { in: ['Active', 'Approved', 'approved'] };
    } else if (f === 'pending') {
      where.status = 'Pending';
    } else if (f === 'blocked') {
      where.status = { in: ['Blocked', 'blocked'] };
    } else if (f === 'rejected' || f === 'deleted') {
      where.status = { in: ['Rejected', 'Deleted', 'deleted'] };
    }
  }

  const users = await prisma.aspnet_Users.findMany({
    where,
    include: {
      aspnet_UsersInRoles: {
        include: {
          aspnet_Roles: true,
        },
      },
    },
  });

  return users.map(user => {
    let mappedStatus: 'Pending' | 'Active' | 'Blocked' | 'Rejected' = 'Pending';
    const s = user.status.toLowerCase();
    if (s === 'active' || s === 'approved') {
      mappedStatus = 'Active';
    } else if (s === 'blocked') {
      mappedStatus = 'Blocked';
    } else if (s === 'deleted' || s === 'rejected') {
      mappedStatus = 'Rejected';
    }

    const dbRole = user.aspnet_UsersInRoles[0]?.aspnet_Roles?.RoleName || 'AUDITOR';
    let mappedRole = 'Auditor';
    if (dbRole.toUpperCase() === 'ADMINISTRATOR') {
      mappedRole = 'Administrator';
    } else if (dbRole.toUpperCase() === 'SUPERVISOR') {
      mappedRole = 'Supervisor';
    }

    return {
      id: user.UserId,
      username: user.UserName,
      email: user.Email,
      fullName: user.Name,
      role: mappedRole,
      accountStatus: mappedStatus,
      createdAt: user.LastActivityDate,
    };
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
      data: { status: 'Deleted' },
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
      data: { status: 'Active' },
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
      data: { status: 'Blocked' },
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

// Role membership check. Role names in aspnet_Roles can theoretically be
// scoped to a plant (idPlant is nullable on aspnet_Roles), but this checks
// role membership globally — it doesn't care which plant the role row is
// tied to. Plant-appropriateness of an audit assignment is validated
// separately in the audits controller via plantsService. If you actually
// need "does this user hold AUDITOR specifically at plant X", this needs
// a plantId param added and filtered on aspnet_Roles.idPlant.
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  const match = await prisma.aspnet_UsersInRoles.findFirst({
    where: {
      UserId: userId,
      aspnet_Roles: { LoweredRoleName: roleName.toLowerCase() },
    },
  });

  return !!match;
}

// --- Supervisor assignment (per-plant) ---
// AffectationUserUserChef has no unique constraint on (UserId, idPlant),
// so "editing" a supervisor is: find the row for this auditor+plant,
// update it if it exists, create it if it doesn't. This avoids duplicate
// rows for the same auditor/plant pair.

export async function listAuditorSupervisors(auditorId: string) {
  await ensureUserExists(auditorId);

  return prisma.affectationUserUserChef.findMany({
    where: { UserId: auditorId },
    include: {
      chef: {
        select: { UserId: true, Name: true, Email: true },
      },
      plant: true,
    },
  });
}

export async function setAuditorSupervisor(
  auditorId: string,
  plantId: number,
  supervisorId: string
) {
  await ensureUserExists(auditorId);
  await ensureUserExists(supervisorId);

  if (auditorId === supervisorId) {
    throw new AppError(400, 'An auditor cannot be their own supervisor');
  }

  const existing = await prisma.affectationUserUserChef.findFirst({
    where: { UserId: auditorId, idPlant: plantId },
  });

  if (existing) {
    return prisma.affectationUserUserChef.update({
      where: { idaffectuser: existing.idaffectuser },
      data: { UserIdSup: supervisorId },
    });
  }

  return prisma.affectationUserUserChef.create({
    data: {
      UserId: auditorId,
      UserIdSup: supervisorId,
      idPlant: plantId,
    },
  });
}

export async function removeAuditorSupervisor(auditorId: string, plantId: number) {
  const existing = await prisma.affectationUserUserChef.findFirst({
    where: { UserId: auditorId, idPlant: plantId },
  });

  if (!existing) {
    throw new AppError(404, 'No assignment found for this auditor and plant');
  }

  // Clears the supervisor but keeps the auditor-plant assignment row intact,
  // since deleting the row would also remove the plant assignment itself.
  return prisma.affectationUserUserChef.update({
    where: { idaffectuser: existing.idaffectuser },
    data: { UserIdSup: null },
  });
}

export async function listSupervisors() {
  return prisma.aspnet_Users.findMany({
    where: {
      aspnet_UsersInRoles: {
        some: {
          aspnet_Roles: {
            LoweredRoleName: 'supervisor',
          },
        },
      },
      status: { in: ['Active', 'Approved', 'approved'] },
    },
    select: {
      UserId: true,
      UserName: true,
      Email: true,
      Name: true,
    },
  });
}

export async function listSupervisorAuditors(supervisorId: string) {
  const affectations = await prisma.affectationUserUserChef.findMany({
    where: { UserIdSup: supervisorId },
    include: {
      user: {
        select: {
          UserId: true,
          UserName: true,
          Email: true,
          Name: true,
        },
      },
      plant: {
        select: {
          idPlant: true,
          designationPlant: true,
        },
      },
    },
  });

  return affectations
    .filter((aff) => aff.user)
    .map((aff) => ({
      id: aff.user!.UserId,
      username: aff.user!.UserName,
      email: aff.user!.Email,
      fullName: aff.user!.Name,
      plantId: aff.idPlant,
      plantName: aff.plant?.designationPlant ?? null,
    }));
}