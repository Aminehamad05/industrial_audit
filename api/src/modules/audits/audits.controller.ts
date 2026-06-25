// src/modules/audits/audits.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as auditsService from './audits.service';
import * as usersService from '../users/user.service';
import * as plantsService from '../plants/plant.service';
import { NotFoundError, DomainError } from '../../shared/errors/domain-error';

export async function listAudits(req: Request, res: Response, next: NextFunction) {
  try {
    const auditorId = typeof req.query.auditorId === 'string' ? req.query.auditorId : undefined;
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
    const status = req.query.status as 'upcoming' | 'in_progress' | 'completed' | undefined;

    const audits = await auditsService.listAudits({ auditorId, plantId, status });
    const withStatus = audits.map((audit) => ({
      ...audit,
      derivedStatus: auditsService.deriveAuditStatus(audit),
    }));

    res.json({ audits: withStatus });
  } catch (err) {
    next(err);
  }
}

export async function getAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const auditId = Number(req.params.id);
    const audit = await auditsService.getAuditById(auditId);
    res.json({ audit: { ...audit, derivedStatus: auditsService.deriveAuditStatus(audit) } });
  } catch (err) {
    next(err);
  }
}

// Admin-only (enforced by requireRole in the router). This is the
// orchestration point: validates auditor/supervisor/plant exist and resolves
// the right denormalized strings, THEN hands fully-resolved data to
// auditsService, which never has to know users/plants exist.
export async function createAndAssignAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = req.body;

    const auditor = await usersService.getUserById(dto.auditorId);
    if (!auditor) {
      throw new NotFoundError(`Auditor ${dto.auditorId} not found`);
    }
    if (auditor.role !== 'Auditor') {
      throw new DomainError(`User ${dto.auditorId} is not an Auditor`, 400);
    }

    let supervisor = null;
    if (dto.supervisorId) {
      supervisor = await usersService.getUserById(dto.supervisorId);
      if (!supervisor) {
        throw new NotFoundError(`Supervisor ${dto.supervisorId} not found`);
      }
    }

    const plant = await plantsService.getPlantById(dto.plantId);
    if (!plant) {
      throw new NotFoundError(`Plant ${dto.plantId} not found`);
    }

    const audit = await auditsService.createAudit({
      auditType: dto.auditType,
      auditTypeName: dto.auditTypeName,
      auditTarget: dto.auditTarget,
      auditTargetArea: dto.auditTargetArea,
      auditTargetSubarea: dto.auditTargetSubarea,
      auditTargetSection: dto.auditTargetSection,
      auditShiftName: dto.auditShiftName,
      auditorId: auditor.id,
      auditorLogin: auditor.email, // swap to auditor.login if that's the real field name
      auditorFullName: auditor.fullName,
      supervisorId: supervisor?.id,
      supervisorName: supervisor?.fullName,
      supervisorLogin: supervisor?.email,
      startDate: dto.startDate,
      plantId: plant.id,
      matricule: dto.matricule,
      scheduleId: dto.scheduleId,
    });

    res.status(201).json({ audit });
  } catch (err) {
    next(err);
  }
}

// Admin-only. Same orchestration shape as above, smaller scope.
export async function reassignAuditor(req: Request, res: Response, next: NextFunction) {
  try {
    const auditId = Number(req.params.id);
    const { auditorId: newAuditorId } = req.body;

    const auditor = await usersService.getUserById(newAuditorId);
    if (!auditor) {
      throw new NotFoundError(`Auditor ${newAuditorId} not found`);
    }
    if (auditor.role !== 'Auditor') {
      throw new DomainError(`User ${newAuditorId} is not an Auditor`, 400);
    }

    const audit = await auditsService.reassignAuditor(
      auditId, auditor.id, auditor.email, auditor.fullName
    );
    res.json({ audit });
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const auditId = Number(req.params.id);
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new DomainError('Request body must be a non-empty array of detail items', 400);
    }

    for (const item of items) {
      if (
        typeof item.groupPosition !== 'number' ||
        typeof item.questionPosition !== 'number' ||
        !item.groupName ||
        !item.groupNameEng ||
        !item.question ||
        !item.questionEng
      ) {
        throw new DomainError('Each detail item must have groupPosition, groupName, groupNameEng, questionPosition, question, questionEng', 400);
      }
    }

    const details = await auditsService.createBulkDetails(auditId, items);
    res.status(201).json({ details });
  } catch (err) {
    next(err);
  }
}

// Admin dashboard overview — list all audits with derived status. No
// per-audit auditor lookup needed here since auditorFullName is already
// denormalized onto the Audit row from creation time.
export async function getDashboardAudits(req: Request, res: Response, next: NextFunction) {
  try {
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
    const status = req.query.status as 'upcoming' | 'in_progress' | 'completed' | undefined;

    const audits = await auditsService.listAudits({ plantId, status });
    const result = audits.map((audit) => ({
      id: audit.id,
      auditTypeName: audit.auditTypeName,
      auditTarget: audit.auditTarget,
      auditorFullName: audit.auditorFullName,
      plantId: audit.plantId,
      startDate: audit.startDate,
      endDate: audit.endDate,
      score: audit.score,
      status: auditsService.deriveAuditStatus(audit),
    }));

    res.json({ audits: result });
  } catch (err) {
    next(err);
  }
}