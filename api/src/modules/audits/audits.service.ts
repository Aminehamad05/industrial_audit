// src/modules/audits/audits.service.ts
import { AppDataSource } from '../../db/data-source';
import { Audit } from "./entitites/Audit"
import { AuditDetail } from "./entitites/AuditDetail"
import { NotFoundError } from '../../shared/errors/domain-error';
import { CreateAuditDto } from './dto/create-audit.dto';
import { string } from 'zod';

interface ListAuditsFilters {
  auditorId?: string  ;
  plantId?: number;
  status?: 'upcoming' | 'in_progress' | 'completed';
}

export async function listAudits(filters: ListAuditsFilters): Promise<Audit[]> {
  const repo = AppDataSource.getRepository(Audit);
  const qb = repo.createQueryBuilder('audit');

  if (filters.auditorId) {
    qb.andWhere('audit.auditorId = :auditorId', { auditorId: filters.auditorId });
  }
  if (filters.plantId) {
    qb.andWhere('audit.plantId = :plantId', { plantId: filters.plantId });
  }
  if (filters.status === 'upcoming') {
    qb.andWhere('audit.startDate > :now AND audit.endDate IS NULL', { now: new Date() });
  } else if (filters.status === 'in_progress') {
    qb.andWhere('audit.startDate <= :now AND audit.endDate IS NULL', { now: new Date() });
  } else if (filters.status === 'completed') {
    qb.andWhere('audit.endDate IS NOT NULL');
  }

  qb.orderBy('audit.startDate', 'DESC');
  return qb.getMany();
}

export async function getAuditById(auditId: number): Promise<Audit> {
  const audit = await AppDataSource.getRepository(Audit).findOne({
  where: { id: auditId },
  relations: {
    details: true,
    actions: true,
    },
  });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }
  return audit;
}

// Takes fully-resolved data only. This function does NOT check that
// auditorId/plantId exist — that validation happens in the controller,
// which is the one layer allowed to know about the users/plants modules.
export async function createAudit(dto: CreateAuditDto): Promise<Audit> {
  const repo = AppDataSource.getRepository(Audit);

  const audit = repo.create({
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
    supervisorId: dto.supervisorId,
    supervisorName: dto.supervisorName ?? null,
    supervisorLogin: dto.supervisorLogin ?? null,
    startDate: new Date(dto.startDate),
    endDate: null,
    score: null,
    comment: null,
    plantId: dto.plantId,
    matricule: dto.matricule ?? null,
    scheduleId: dto.scheduleId ?? null,
  });

  return repo.save(audit);
}

// Same contract — caller already validated newAuditorId exists and has the
// right role before reaching here.
export async function reassignAuditor(
  auditId: number,
  newAuditorId: string,
  newAuditorLogin: string,
  newAuditorFullName: string
): Promise<Audit> {
  const repo = AppDataSource.getRepository(Audit);
  const audit = await repo.findOne({ where: { id: auditId } });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }

  audit.auditorId = newAuditorId;
  audit.auditorLogin = newAuditorLogin;
  audit.auditorFullName = newAuditorFullName;
  return repo.save(audit);
}

export async function updateAuditResult(
  auditId: number,
  dto: { endDate?: string; score?: number; comment?: string }
): Promise<Audit> {
  const repo = AppDataSource.getRepository(Audit);
  const audit = await repo.findOne({ where: { id: auditId } });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }

  if (dto.endDate !== undefined) audit.endDate = new Date(dto.endDate);
  if (dto.score !== undefined) audit.score = dto.score;
  if (dto.comment !== undefined) audit.comment = dto.comment;

  return repo.save(audit);
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
): Promise<AuditDetail[]> {
  const repo = AppDataSource.getRepository(AuditDetail);
  const audit = await AppDataSource.getRepository(Audit).findOne({ where: { id: auditId } });
  if (!audit) {
    throw new NotFoundError(`Audit ${auditId} not found`);
  }

  const details = items.map((item) =>
    repo.create({
      auditId,
      groupPosition: item.groupPosition,
      groupName: item.groupName,
      groupNameEng: item.groupNameEng,
      questionPosition: item.questionPosition,
      question: item.question,
      questionEng: item.questionEng,
      plantId: audit.plantId,
    })
  );

  return repo.save(details);
}

// Pure, no DB access. Single source of truth for "what counts as in
// progress" since there's no status column in the real schema.
export function deriveAuditStatus(audit: Audit): 'Upcoming' | 'InProgress' | 'Completed' {
  if (audit.endDate) return 'Completed';
  if (audit.startDate <= new Date()) return 'InProgress';
  return 'Upcoming';
}