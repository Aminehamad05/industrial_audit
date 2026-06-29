import { prisma } from '../../db/prisma';
import { NotFoundError } from '../../shared/errors/domain-error';
import { CreateAuditDto } from './dto/create-audit.dto';

interface ListAuditsFilters {
  auditorId?: string;
  plantId?: number;
  status?: 'upcoming' | 'in_progress' | 'completed';
}

export async function listAudits(filters: ListAuditsFilters) {
  const where: Record<string, unknown> = {};

  if (filters.auditorId) {
    where.auditorId = filters.auditorId;
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
      auditorId: dto.auditorId,
      auditorLogin: dto.auditorLogin,
      auditorFullName: dto.auditorFullName,
      supervisorId: dto.supervisorId ?? null,
      supervisorName: dto.supervisorName ?? null,
      supervisorLogin: dto.supervisorLogin ?? null,
      startDate: new Date(dto.startDate),
      endDate: null,
      score: null,
      comment: null,
      plantId: dto.plantId,
      matricule: dto.matricule ?? null,
      scheduleId: dto.scheduleId ?? null,
    },
  });
}

export async function reassignAuditor(
  auditId: number,
  newAuditorId: string,
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
      auditorId: newAuditorId,
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

export async function createBulkDetails(
  auditId: number,
  items: Array<{
    groupPosition: number;
    groupName: string;
    groupNameEng: string;
    questionPosition: number;
    question: string;
    questionEng: string;
  }>
) {
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
      plantId: audit.plantId,
    })),
  });

  return prisma.audit_details.findMany({ where: { auditId } });
}

export function deriveAuditStatus(audit: {
  startDate: Date | string;
  endDate?: Date | string | null;
  detailsCount?: number;
}) {
  const now = new Date();
  const start = new Date(audit.startDate);

  if (audit.endDate) return 'Completed';

  if ((audit.detailsCount ?? 0) === 0 && start < now) {
    return 'Missed';
  }

  if ((audit.detailsCount ?? 0) > 0) {
    return 'InProgress';
  }

  return 'Upcoming';
}
