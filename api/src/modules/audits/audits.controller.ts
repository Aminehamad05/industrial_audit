// src/modules/audits/audits.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as auditsService from './audits.service';
import * as usersService from '../users/user.service';
import * as plantsService from '../plants/plant.service';
import { NotFoundError, DomainError } from '../../shared/errors/domain-error';

export async function listAudits(req: Request, res: Response, next: NextFunction) {
  try {
    const auditorLogin =
      typeof req.query.auditorLogin === 'string' ? req.query.auditorLogin : undefined;
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
    const status = req.query.status as
      | 'upcoming'
      | 'in_progress'
      | 'completed'
      | 'failed'
      | undefined;

    const audits = await auditsService.listAudits({ auditorLogin, plantId, status });
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
//
// NOTE: audits.auditorLogin / .supervisorLogin join to aspnet_Users.UserName
// (FK_audits_auditor / FK_audits_supervisor), not a UserId column — there is
// no auditorId/supervisorId field on the audits table. dto.auditorId /
// dto.supervisorId below are aspnet_Users.UserId values used only to look up
// the user; what actually gets stored on the audit is UserName + Name.
//
export async function createAndAssignAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = req.body;

    const auditor = await usersService.getUserById(dto.auditorId);
    if (!auditor) {
      throw new NotFoundError(`Auditor ${dto.auditorId} not found`);
    }
    if (!(await usersService.userHasRole(auditor.UserId, 'AUDITOR'))) {
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
      auditorLogin: auditor.UserName as string,
      auditorFullName: auditor.Name as string,
      supervisorName: supervisor?.Name as string,
      supervisorLogin: supervisor?.UserName ?? undefined,
      startDate: dto.startDate,
      plantId: plant.idPlant,
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
    if (!(await usersService.userHasRole(auditor.UserId, 'AUDITOR'))) {
      throw new DomainError(`User ${newAuditorId} is not an Auditor`, 400);
    }

    const audit = await auditsService.reassignAuditor(auditId, auditor.UserName!, auditor.Name!);
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
        !item.questionEng ||
        typeof item.answerOk !== 'boolean' ||
        typeof item.answerNok !== 'boolean' ||
        typeof item.answerNc !== 'boolean' ||
        typeof item.answerNa !== 'boolean'
      ) {
        throw new DomainError(
          'Each detail item must have groupPosition, groupName, groupNameEng, questionPosition, question, questionEng, answerOk, answerNok, answerNc, answerNa',
          400
        );
      }

      if (item.ponderation !== undefined && typeof item.ponderation !== 'number') {
        throw new DomainError('ponderation must be a number when provided', 400);
      }
      if (item.eliminatoire !== undefined && typeof item.eliminatoire !== 'boolean') {
        throw new DomainError('eliminatoire must be a boolean when provided', 400);
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
    const status = req.query.status as
      | 'upcoming'
      | 'in_progress'
      | 'completed'
      | 'failed'
      | undefined;

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
      eliminated: audit.eliminated,
      status: auditsService.deriveAuditStatus(audit),
    }));

    res.json({ audits: result });
  } catch (err) {
    next(err);
  }
}