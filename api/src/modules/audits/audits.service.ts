import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors/appError';
import { NotFoundError } from '../../shared/errors/domain-error';
import { CreateAuditDto } from './dto/create-audit.dto';

interface ListAuditsFilters {
  auditorLogin?: string;
  plantId?: number;
  status?: 'upcoming' | 'in_progress' | 'completed' | 'failed';
}

export async function listAudits(filters: ListAuditsFilters) {
  const where: Record<string, unknown> = {};

  if (filters.auditorLogin) {
    where.auditorLogin = filters.auditorLogin;
  }
  if (filters.plantId) {
    where.plantId = filters.plantId;
  }

  const now = new Date();
  if (filters.status === 'upcoming') {
    where.startDate = { gt: now } as any;
    where.endDate = null;
  } else if (filters.status === 'in_progress') {
    where.startDate = { lte: now } as any;
    where.endDate = null;
  } else if (filters.status === 'completed') {
    where.endDate = { not: null } as any;
    where.eliminated = false;
  } else if (filters.status === 'failed') {
    where.eliminated = true;
  }

  return prisma.audits.findMany({
    where: where as any,
    orderBy: { startDate: 'desc' },
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
      auditorLogin: dto.auditorLogin,
      auditorFullName: dto.auditorFullName,
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

export function deriveAuditStatus(audit: {
  startDate: Date | string;
  endDate?: Date | string | null;
  eliminated?: boolean;
  detailsCount?: number;
}) {
  const now = new Date();
  const start = new Date(audit.startDate);
  if (!audit.startDate) {
    return new AppError(400,"Missing start Date");
  }
  if (audit.eliminated) return 'Failed';

  if (audit.endDate) return 'Completed';

  if ((audit.detailsCount ?? 0) === 0 && start < now) {
    return 'Missed';
  }

  if ((audit.detailsCount ?? 0) > 0) {
    return 'InProgress';
  }

  return 'Upcoming';
}