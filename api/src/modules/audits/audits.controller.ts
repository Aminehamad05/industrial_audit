// src/modules/audits/audits.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as auditsService from './audits.service';
import * as kpisService from './kpis.service';
import * as usersService from '../users/user.service';
import * as plantsService from '../plants/plant.service';
import { NotFoundError, DomainError, ForbiddenError } from '../../shared/errors/domain-error';

export async function listAudits(req: Request, res: Response, next: NextFunction) {
  try {
    const auditorLogin =
      typeof req.query.auditorLogin === 'string' ? req.query.auditorLogin : undefined;
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
    let supervisorId =
      typeof req.query.supervisorId === 'string' ? req.query.supervisorId : undefined;
    const unassignedOnly = req.query.unassignedOnly === 'true';
    const status = req.query.status as
      | 'upcoming'
      | 'in_progress'
      | 'completed'
      | 'failed'
      | 'missed'
      | undefined;

    if (req.user?.role === 'SUPERVISOR') {
      supervisorId = req.user.userId;
    }

    const audits = await auditsService.listAudits({
      auditorLogin,
      plantId,
      status,
      supervisorId,
      unassignedOnly,
    });
    const withStatus = audits.map((audit) => auditsService.auditWithDerivedStatus(audit));

    res.json({ audits: withStatus });
  } catch (err) {
    next(err);
  }
}

export async function getAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const auditId = Number(req.params.id);
    const audit = await auditsService.getAuditById(auditId);
    res.json({ audit: auditsService.auditWithDerivedStatus(audit) });
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

    if (!dto.auditShiftName) {
      throw new DomainError('auditShiftName is required', 400);
    }

    // Resolve supervisor — supervisors self-assign via JWT, admins pick from body
    let supervisorId = dto.supervisorId;
    if (req.user?.role === 'SUPERVISOR') {
      supervisorId = req.user.userId;
    }
    if (!supervisorId) {
      throw new DomainError('supervisorId is required', 400);
    }

    const supervisor = await usersService.getUserById(supervisorId);
    if (!supervisor) {
      throw new NotFoundError(`Supervisor ${supervisorId} not found`);
    }
    if (!(await usersService.userHasRole(supervisor.UserId, 'SUPERVISOR'))) {
      throw new DomainError(`User ${supervisorId} is not a Supervisor`, 400);
    }

    let auditorLogin: string | null = null;
    let auditorFullName: string | null = null;
    if (dto.auditorId) {
      // Supervisors can only assign auditors from their own team
      if (req.user?.role === 'SUPERVISOR') {
        const team = await usersService.listSupervisorAuditors(req.user.userId);
        if (!team.some((member) => member.id === dto.auditorId)) {
          throw new ForbiddenError('Auditor is not in your assigned team');
        }
      }

      const auditor = await usersService.getUserById(dto.auditorId);
      if (!auditor) {
        throw new NotFoundError(`Auditor ${dto.auditorId} not found`);
      }
      if (!(await usersService.userHasRole(auditor.UserId, 'AUDITOR'))) {
        throw new DomainError(`User ${dto.auditorId} is not an Auditor`, 400);
      }
      auditorLogin = auditor.UserName as string;
      auditorFullName = auditor.Name as string;
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
      auditorLogin,
      auditorFullName,
      supervisorName: supervisor.Name as string,
      supervisorLogin: supervisor.UserName ?? undefined,
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

    const audit = await auditsService.getAuditById(auditId);

    const auditor = await usersService.getUserById(newAuditorId);
    if (!auditor) {
      throw new NotFoundError(`Auditor ${newAuditorId} not found`);
    }
    if (!(await usersService.userHasRole(auditor.UserId, 'AUDITOR'))) {
      throw new DomainError(`User ${newAuditorId} is not an Auditor`, 400);
    }

    if (req.user?.role === 'SUPERVISOR') {
      const supervisor = await usersService.getUserById(req.user.userId);
      if (audit.supervisorLogin !== supervisor.UserName) {
        throw new ForbiddenError('You can only assign auditors on audits assigned to you');
      }

      const team = await usersService.listSupervisorAuditors(req.user.userId);
      if (!team.some((member) => member.id === newAuditorId)) {
        throw new ForbiddenError('Auditor is not in your assigned team');
      }
    }

    const updated = await auditsService.reassignAuditor(
      auditId,
      auditor.UserName!,
      auditor.Name!
    );
    res.json({ audit: updated });
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
export async function getAuditKpis(req: Request, res: Response, next: NextFunction) {
  try {
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
    const auditorLogin =
      typeof req.query.auditorLogin === 'string' ? req.query.auditorLogin : undefined;
    const auditType = typeof req.query.auditType === 'string' ? req.query.auditType : undefined;
    const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;

    const filters: kpisService.KpiQueryFilters = {
      plantId: Number.isFinite(plantId) ? plantId : undefined,
      auditorLogin,
      auditType,
      from: from && !isNaN(from.getTime()) ? from : undefined,
      to: to && !isNaN(to.getTime()) ? to : undefined,
    };

    if (req.user?.role === 'SUPERVISOR') {
      filters.supervisorId = req.user.userId;
    }

    const kpis = await kpisService.getAuditKpis(filters);
    res.json({ kpis });
  } catch (err) {
    next(err);
  }
}

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
    const result = audits.map((audit) => {
      const withStatus = auditsService.auditWithDerivedStatus(audit);
      return {
        id: withStatus.id,
        auditTypeName: withStatus.auditTypeName,
        auditTarget: withStatus.auditTarget,
        auditorFullName: withStatus.auditorFullName,
        supervisorName: withStatus.supervisorName,
        auditShiftName: withStatus.auditShiftName,
        plantId: withStatus.plantId,
        startDate: withStatus.startDate,
        endDate: withStatus.endDate,
        score: withStatus.score,
        eliminated: withStatus.eliminated,
        status: withStatus.derivedStatus,
      };
    });

    res.json({ audits: result });
  } catch (err) {
    next(err);
  }
}