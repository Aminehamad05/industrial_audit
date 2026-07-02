// Run with: npx tsx src/db/seed_test.ts

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { recomputeAuditScore } from '../modules/audits/audits.service';

const TEST_PASSWORD = 'amine2005';

const TEST_USERNAMES = [
  'admin.test',
  'supervisor1.test',
  'supervisor2.test',
  'auditor1.test',
  'auditor2.test',
  'auditor3.test',
] as const;

async function cleanupPreviousRun() {
  const existing = await prisma.aspnet_Users.findMany({
    where: { UserName: { in: [...TEST_USERNAMES] } },
    select: { UserId: true },
  });

  if (existing.length === 0) return;

  const userIds = existing.map((u) => u.UserId);

  await prisma.audit_details.deleteMany({
    where: { audit: { auditorLogin: { in: [...TEST_USERNAMES] } } },
  });
  await prisma.audits.deleteMany({
    where: { auditorLogin: { in: [...TEST_USERNAMES] } },
  });
  await prisma.schedules.deleteMany({
    where: { auditor_login: { in: [...TEST_USERNAMES] } },
  });
  await prisma.affectationUserUserChef.deleteMany({
    where: { OR: [{ UserId: { in: userIds } }, { UserIdSup: { in: userIds } }] },
  });
  await prisma.aspnet_UsersInRoles.deleteMany({ where: { UserId: { in: userIds } } });
  await prisma.aspnet_Membership.deleteMany({ where: { UserId: { in: userIds } } });
  await prisma.aspnet_Users.deleteMany({ where: { UserId: { in: userIds } } });
}

async function ensurePlants() {
  const plants = await prisma.plant.findMany({ take: 2 });
  if (plants.length >= 2) return plants;

  const needed = 2 - plants.length;
  for (let i = 0; i < needed; i++) {
    await prisma.plant.create({
      data: { designationPlant: `Test Plant ${plants.length + i + 1}` },
    });
  }

  return prisma.plant.findMany({ take: 2 });
}

async function main() {
  console.log('Cleaning up previous test seed data...');
  await cleanupPreviousRun();

  console.log('Looking up existing aspnet_Applications row...');
  const app = await prisma.aspnet_Applications.findFirst();
  if (!app) {
    throw new Error(
      'No aspnet_Applications row found. Create one manually first (ApplicationName: "development").'
    );
  }

  console.log('Ensuring roles exist...');
  const roleNames = ['ADMINISTRATOR', 'AUDITOR', 'SUPERVISOR'] as const;
  const roles: Record<string, { RoleId: string }> = {};

  for (const roleName of roleNames) {
    let role = await prisma.aspnet_Roles.findFirst({
      where: {
        LoweredRoleName: roleName.toLowerCase(),
        ApplicationId: app.ApplicationId,
      },
    });
    if (!role) {
      role = await prisma.aspnet_Roles.create({
        data: {
          ApplicationId: app.ApplicationId,
          RoleName: roleName,
          LoweredRoleName: roleName.toLowerCase(),
          idPlant: null,
        },
      });
    }
    roles[roleName] = { RoleId: role.RoleId };
  }

  console.log('Ensuring at least 2 plants exist...');
  const plants = await ensurePlants();
  const [plantA, plantB] = plants;

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  const now = new Date();

  async function createUser(opts: {
    userName: string;
    name: string;
    email: string;
    role: keyof typeof roles;
  }) {
    const userId = randomUUID();
    const normalizedEmail = opts.email.trim().toLowerCase();
    const normalizedUserName = opts.userName.trim().toLowerCase();

    await prisma.aspnet_Users.create({
      data: {
        UserId: userId,
        ApplicationId: app.ApplicationId,
        UserName: opts.userName,
        LoweredUserName: normalizedUserName,
        Email: normalizedEmail,
        Name: opts.name,
        status: 'approved',
        IsAnonymous: false,
        LastActivityDate: now,
        passwordHash,
      },
    });

    await prisma.aspnet_Membership.create({
      data: {
        ApplicationId: app.ApplicationId,
        UserId: userId,
        Password: passwordHash,
        PasswordFormat: 1,
        PasswordSalt: 'n/a',
        Email: normalizedEmail,
        LoweredEmail: normalizedEmail,
        IsApproved: true,
        IsLockedOut: false,
        CreateDate: now,
        LastLoginDate: now,
        LastPasswordChangedDate: now,
        LastLockoutDate: now,
        FailedPasswordAttemptCount: 0,
        FailedPasswordAttemptWindowStart: now,
        FailedPasswordAnswerAttemptCount: 0,
        FailedPasswordAnswerAttemptWindowStart: now,
      },
    });

    await prisma.aspnet_UsersInRoles.create({
      data: {
        UserId: userId,
        RoleId: roles[opts.role].RoleId,
      },
    });

    return userId;
  }

  console.log('Ensuring shift definitions exist...');
  const shiftNames = ['Shift A', 'Shift B', 'Shift C'];
  for (const shiftName of shiftNames) {
    const existing = await prisma.setts_shifts.findFirst({ where: { shift_name: shiftName } });
    if (!existing) {
      await prisma.setts_shifts.create({ data: { shift_name: shiftName } });
    }
  }

  console.log('Creating admin...');
  await createUser({
    userName: 'admin.test',
    name: 'Admin Test',
    email: 'admin.test@example.com',
    role: 'ADMINISTRATOR',
  });

  console.log('Creating supervisors...');
  const supervisor1 = await createUser({
    userName: 'supervisor1.test',
    name: 'Sami Supervisor',
    email: 'supervisor1.test@example.com',
    role: 'SUPERVISOR',
  });
  const supervisor2 = await createUser({
    userName: 'supervisor2.test',
    name: 'Sara Supervisor',
    email: 'supervisor2.test@example.com',
    role: 'SUPERVISOR',
  });

  console.log('Creating auditors...');
  const auditor1 = await createUser({
    userName: 'auditor1.test',
    name: 'Amir Auditor',
    email: 'auditor1.test@example.com',
    role: 'AUDITOR',
  });
  const auditor2 = await createUser({
    userName: 'auditor2.test',
    name: 'Aya Auditor',
    email: 'auditor2.test@example.com',
    role: 'AUDITOR',
  });
  const auditor3 = await createUser({
    userName: 'auditor3.test',
    name: 'Ali Auditor',
    email: 'auditor3.test@example.com',
    role: 'AUDITOR',
  });

  console.log('Assigning auditors to supervisors per plant...');
  await prisma.affectationUserUserChef.createMany({
    data: [
      { UserId: auditor1, UserIdSup: supervisor1, idPlant: plantA.idPlant },
      { UserId: auditor2, UserIdSup: supervisor1, idPlant: plantA.idPlant },
      { UserId: auditor3, UserIdSup: supervisor2, idPlant: plantB.idPlant },
    ],
  });

  const auditorLogins: Record<string, { login: string; fullName: string; plant: typeof plantA }> = {
    [auditor1]: { login: 'auditor1.test', fullName: 'Amir Auditor', plant: plantA },
    [auditor2]: { login: 'auditor2.test', fullName: 'Aya Auditor', plant: plantA },
    [auditor3]: { login: 'auditor3.test', fullName: 'Ali Auditor', plant: plantB },
  };

  console.log('Creating audits in varied states for UI testing...');
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
  const daysAhead = (n: number) => new Date(now.getTime() + n * 86400000);

  for (const [, info] of Object.entries(auditorLogins)) {
    const passedAudit = await prisma.audits.create({
      data: {
        auditType: 'quality',
        auditTypeName: 'Quality Audit',
        auditTarget: 'Line A',
        auditorLogin: info.login,
        auditorFullName: info.fullName,
        startDate: daysAgo(10),
        endDate: daysAgo(9),
        plantId: info.plant.idPlant,
        eliminated: false,
      },
    });
    await prisma.audit_details.createMany({
      data: [
        {
          auditId: passedAudit.id,
          groupPosition: 1,
          groupName: 'Safety',
          groupNameEng: 'Safety',
          questionPosition: 1,
          question: 'Extincteurs accessibles ?',
          questionEng: 'Extinguishers accessible?',
          answerOk: true,
          answerNok: false,
          answerNc: false,
          answerNa: false,
          ponderation: 2,
          eliminatoire: false,
          plantId: info.plant.idPlant,
        },
        {
          auditId: passedAudit.id,
          groupPosition: 1,
          groupName: 'Safety',
          groupNameEng: 'Safety',
          questionPosition: 2,
          question: 'Sol propre et sec ?',
          questionEng: 'Floor clean and dry?',
          answerOk: true,
          answerNok: false,
          answerNc: false,
          answerNa: false,
          ponderation: 1,
          eliminatoire: false,
          plantId: info.plant.idPlant,
        },
      ],
    });
    await recomputeAuditScore(passedAudit.id);

    const failedAudit = await prisma.audits.create({
      data: {
        auditType: 'safety',
        auditTypeName: 'Safety Audit',
        auditTarget: 'Line B',
        auditorLogin: info.login,
        auditorFullName: info.fullName,
        startDate: daysAgo(5),
        endDate: daysAgo(4),
        plantId: info.plant.idPlant,
        eliminated: false,
      },
    });
    await prisma.audit_details.createMany({
      data: [
        {
          auditId: failedAudit.id,
          groupPosition: 1,
          groupName: 'Critical Safety',
          groupNameEng: 'Critical Safety',
          questionPosition: 1,
          question: "Arret d'urgence fonctionnel ?",
          questionEng: 'Emergency stop functional?',
          answerOk: false,
          answerNok: true,
          answerNc: false,
          answerNa: false,
          ponderation: 5,
          eliminatoire: true,
          plantId: info.plant.idPlant,
        },
      ],
    });
    await recomputeAuditScore(failedAudit.id);

    const inProgressAudit = await prisma.audits.create({
      data: {
        auditType: 'quality',
        auditTypeName: 'Quality Audit',
        auditTarget: 'Line C',
        auditorLogin: info.login,
        auditorFullName: info.fullName,
        startDate: daysAgo(1),
        endDate: null,
        plantId: info.plant.idPlant,
        eliminated: false,
      },
    });
    await prisma.audit_details.create({
      data: {
        auditId: inProgressAudit.id,
        groupPosition: 1,
        groupName: 'Documentation',
        groupNameEng: 'Documentation',
        questionPosition: 1,
        question: 'Fiches a jour ?',
        questionEng: 'Sheets up to date?',
        answerOk: true,
        answerNok: false,
        answerNc: false,
        answerNa: false,
        ponderation: 1,
        eliminatoire: false,
        plantId: info.plant.idPlant,
      },
    });

    await prisma.audits.create({
      data: {
        auditType: 'quality',
        auditTypeName: 'Quality Audit',
        auditTarget: 'Line D',
        auditorLogin: info.login,
        auditorFullName: info.fullName,
        startDate: daysAhead(3),
        endDate: null,
        plantId: info.plant.idPlant,
        eliminated: false,
      },
    });

    if (info.login === 'auditor1.test') {
      await prisma.audits.create({
        data: {
          auditType: 'quality',
          auditTypeName: 'Quality Audit',
          auditTarget: 'Line Missed',
          auditorLogin: info.login,
          auditorFullName: info.fullName,
          startDate: daysAgo(7),
          endDate: null,
          auditShiftName: 'Shift B',
          plantId: info.plant.idPlant,
          eliminated: false,
        },
      });
    }
  }

  console.log('Creating supervisor-assigned audit awaiting auditor pick...');
  const supervisorUser = await prisma.aspnet_Users.findFirst({
    where: { UserName: 'supervisor1.test' },
    select: { UserName: true, Name: true },
  });
  if (supervisorUser) {
    await prisma.audits.create({
      data: {
        auditType: 'safety',
        auditTypeName: 'Safety Audit',
        auditTarget: 'Warehouse',
        auditorLogin: null,
        auditorFullName: null,
        supervisorLogin: supervisorUser.UserName,
        supervisorName: supervisorUser.Name,
        auditShiftName: 'Shift A',
        startDate: daysAhead(2),
        endDate: null,
        plantId: plantA.idPlant,
        eliminated: false,
      },
    });
  }

  console.log('Creating sample schedules for calendar testing...');
  const schedule1 = await prisma.schedules.create({
    data: {
      scheduleName: 'Monthly Quality - Line A',
      auditType: 'quality',
      auditTarget: 'Line A',
      auditDate: daysAhead(5),
      auditYear: daysAhead(5).getFullYear(),
      auditMonth: daysAhead(5).getMonth() + 1,
      plantId: plantA.idPlant,
      auditor_login: 'auditor1.test',
      status: 0,
    },
  });
  await prisma.schedules.create({
    data: {
      scheduleName: 'Safety Walk - Line B',
      auditType: 'safety',
      auditTarget: 'Line B',
      auditDate: daysAgo(1),
      auditYear: daysAgo(1).getFullYear(),
      auditMonth: daysAgo(1).getMonth() + 1,
      plantId: plantB.idPlant,
      auditor_login: 'auditor3.test',
      status: 0,
    },
  });

  await prisma.audits.updateMany({
    where: { auditorLogin: 'auditor1.test', auditTarget: 'Line D' },
    data: { scheduleId: schedule1.id },
  });

  console.log('Done. Test users all use password:', TEST_PASSWORD);
  console.log('Log in with email (not username):');
  console.log('  admin.test@example.com');
  console.log('  supervisor1.test@example.com / supervisor2.test@example.com');
  console.log('  auditor1.test@example.com / auditor2.test@example.com / auditor3.test@example.com');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
