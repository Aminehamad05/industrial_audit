import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors/appError';
import { NotFoundError } from '../../shared/errors/domain-error';
import { CreateAuditDto } from './dto/create-audit.dto';

interface ListAuditsFilters {
  auditorLogin?: string;
  plantId?: number;
  status?: 'upcoming' | 'in_progress' | 'completed' | 'failed' | 'missed';
  supervisorId?: string;
  supervisorLogin?: string;
  unassignedOnly?: boolean;
}

export async function listAudits(filters: ListAuditsFilters) {
  const where: Record<string, unknown> = {};

  if (filters.auditorLogin) {
    where.auditorLogin = filters.auditorLogin;
  }
  if (filters.plantId) {
    where.plantId = filters.plantId;
  }
  if (filters.supervisorId || filters.supervisorLogin) {
    let supervisorUserName = filters.supervisorLogin;
    if (filters.supervisorId && !supervisorUserName) {
      const supervisor = await prisma.aspnet_Users.findUnique({
        where: { UserId: filters.supervisorId },
        select: { UserName: true },
      });
      supervisorUserName = supervisor?.UserName ?? undefined;
    }

    const affectations = filters.supervisorId
      ? await prisma.affectationUserUserChef.findMany({
          where: { UserIdSup: filters.supervisorId },
          include: { user: { select: { UserName: true } } },
        })
      : [];

    const auditorLogins = affectations
      .map((aff) => aff.user?.UserName)
      .filter((login): login is string => !!login);

    const scope: Record<string, unknown>[] = [];
    if (supervisorUserName) {
      scope.push({ supervisorLogin: supervisorUserName });
    }
    if (auditorLogins.length > 0) {
      scope.push({ auditorLogin: { in: auditorLogins } });
    }
    if (scope.length > 0) {
      where.OR = scope;
    }
  }

  if (filters.unassignedOnly) {
    where.auditorLogin = null;
  }

  const audits = await prisma.audits.findMany({
    where: where as any,
    include: {
      _count: { select: { audit_details: true } },
    },
    orderBy: { startDate: 'desc' },
  });

  if (!filters.status) return audits;

  const statusMap = {
    upcoming: 'Upcoming',
    in_progress: 'InProgress',
    completed: 'Completed',
    failed: 'Failed',
    missed: 'Missed',
  } as const;

  return audits.filter((audit) => {
    const derived = deriveAuditStatus({
      startDate: audit.startDate,
      endDate: audit.endDate,
      eliminated: audit.eliminated,
      detailsCount: audit._count.audit_details,
    });
    return derived === statusMap[filters.status!];
  });
}

export async function getAuditById(auditId: number) {
  const audit = await prisma.audits.findUnique({
    where: { id: auditId },
    include: {
      audit_details: true,
      actions: true,
    },
  });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }
  return audit;
}

export async function createAudit(dto: CreateAuditDto) {
  return prisma.audits.create({
    data: {
      auditType: dto.auditType,
      auditTypeName: dto.auditTypeName,
      auditTarget: dto.auditTarget,
      auditTargetArea: dto.auditTargetArea ?? null,
      auditTargetSubarea: dto.auditTargetSubarea ?? null,
      auditTargetSection: dto.auditTargetSection ?? null,
      auditShiftName: dto.auditShiftName ?? null,
      auditorLogin: dto.auditorLogin ?? null,
      auditorFullName: dto.auditorFullName ?? null,
      supervisorName: dto.supervisorName ?? null,
      supervisorLogin: dto.supervisorLogin ?? null,
      startDate: new Date(dto.startDate),
      endDate: null,
      score: null,
      comment: null,
      eliminated: false,
      plantId: dto.plantId,
      matricule: dto.matricule ?? null,
      scheduleId: dto.scheduleId ?? null,
    },
  });
}

// auditorLogin joins to aspnet_Users.UserName (see FK_audits_auditor) — not
// a UserId FK. Reassignment therefore rewrites login + full name only.
export async function reassignAuditor(
  auditId: number,
  newAuditorLogin: string,
  newAuditorFullName: string
) {
  const audit = await prisma.audits.findUnique({ where: { id: auditId } });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }

  return prisma.audits.update({
    where: { id: auditId },
    data: {
      auditorLogin: newAuditorLogin,
      auditorFullName: newAuditorFullName,
    },
  });
}

export async function updateAuditResult(
  auditId: number,
  dto: { endDate?: string; score?: number; comment?: string }
) {
  const audit = await prisma.audits.findUnique({ where: { id: auditId } });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }

  return prisma.audits.update({
    where: { id: auditId },
    data: {
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.score !== undefined && { score: dto.score }),
      ...(dto.comment !== undefined && { comment: dto.comment }),
    },
  });
}

interface BulkDetailItem {
  groupPosition: number;
  groupName: string;
  groupNameEng: string;
  questionPosition: number;
  question: string;
  questionEng: string;
  answerOk: boolean;
  answerNok: boolean;
  answerNc: boolean;
  answerNa: boolean;
  ponderation?: number;
  eliminatoire?: boolean;
}

export async function createBulkDetails(auditId: number, items: BulkDetailItem[]) {
  const audit = await prisma.audits.findUnique({ where: { id: auditId } });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }

  await prisma.audit_details.createMany({
    data: items.map((item) => ({
      auditId,
      groupPosition: item.groupPosition,
      groupName: item.groupName,
      groupNameEng: item.groupNameEng,
      questionPosition: item.questionPosition,
      question: item.question,
      questionEng: item.questionEng,
      answerOk: item.answerOk,
      answerNok: item.answerNok,
      answerNc: item.answerNc,
      answerNa: item.answerNa,
      ponderation: item.ponderation ?? 1,
      eliminatoire: item.eliminatoire ?? false,
      plantId: audit.plantId,
    })),
  });

  await recomputeAuditScore(auditId);

  return prisma.audit_details.findMany({ where: { auditId } });
}

// Weighted score = (sum of ponderation on OK answers) / (sum of ponderation
// on OK+NOK answers) * 100. NC/NA answers are excluded from both sides of
// the ratio since they represent "not applicable / not checked", not a
// pass/fail result. Any eliminatoire question answered NOK auto-fails the
// whole audit: score is forced to 0 and audits.eliminated is set true.
export async function recomputeAuditScore(auditId: number) {
  const details = await prisma.audit_details.findMany({ where: { auditId } });

  const eliminated = details.some((d) => d.eliminatoire && d.answerNok);

  const scored = details.filter((d) => d.answerOk || d.answerNok);
  const totalWeight = scored.reduce((sum, d) => sum + Number(d.ponderation), 0);
  const okWeight = scored
    .filter((d) => d.answerOk)
    .reduce((sum, d) => sum + Number(d.ponderation), 0);

  const score = eliminated ? 0 : totalWeight > 0 ? (okWeight / totalWeight) * 100 : null;

  return prisma.audits.update({
    where: { id: auditId },
    data: {
      score,
      eliminated,
    },
  });
}

function toCalendarDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function deriveAuditStatus(audit: {
  startDate: Date | string | null;
  endDate?: Date | string | null;
  eliminated?: boolean;
  detailsCount?: number;
}) {
  if (!audit.startDate) {
    return 'Upcoming';
  }

  const start = new Date(audit.startDate);
  const today = toCalendarDay(new Date());
  const startDay = toCalendarDay(start);
  const detailsCount = audit.detailsCount ?? 0;

  if (audit.eliminated) return 'Failed';
  if (audit.endDate) return 'Completed';

  if (detailsCount === 0 && startDay < today) {
    return 'Missed';
  }

  if (detailsCount > 0) {
    return 'InProgress';
  }

  if (startDay > today) {
    return 'Upcoming';
  }

  if (startDay === today) {
    return 'Upcoming';
  }

  return 'Missed';
}

export function auditWithDerivedStatus<
  T extends {
    startDate: Date | string | null;
    endDate?: Date | string | null;
    eliminated?: boolean;
    _count?: { audit_details: number };
    audit_details?: unknown[];
  },
>(audit: T) {
  const detailsCount =
    audit._count?.audit_details ?? (Array.isArray(audit.audit_details) ? audit.audit_details.length : 0);
  return {
    ...audit,
    derivedStatus: deriveAuditStatus({
      startDate: audit.startDate,
      endDate: audit.endDate,
      eliminated: audit.eliminated,
      detailsCount,
    }),
  };
}