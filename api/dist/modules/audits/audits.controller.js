"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAudits = listAudits;
exports.getAudit = getAudit;
exports.createAndAssignAudit = createAndAssignAudit;
exports.reassignAuditor = reassignAuditor;
exports.bulkCreateDetails = bulkCreateDetails;
exports.getDashboardAudits = getDashboardAudits;
const auditsService = __importStar(require("./audits.service"));
const usersService = __importStar(require("../users/user.service"));
const plantsService = __importStar(require("../plants/plant.service"));
const domain_error_1 = require("../../shared/errors/domain-error");
async function listAudits(req, res, next) {
    try {
        const auditorId = typeof req.query.auditorId === 'string' ? req.query.auditorId : undefined;
        const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
        const status = req.query.status;
        const audits = await auditsService.listAudits({ auditorId, plantId, status });
        const withStatus = audits.map((audit) => ({
            ...audit,
            derivedStatus: auditsService.deriveAuditStatus(audit),
        }));
        res.json({ audits: withStatus });
    }
    catch (err) {
        next(err);
    }
}
async function getAudit(req, res, next) {
    try {
        const auditId = Number(req.params.id);
        const audit = await auditsService.getAuditById(auditId);
        res.json({ audit: { ...audit, derivedStatus: auditsService.deriveAuditStatus(audit) } });
    }
    catch (err) {
        next(err);
    }
}
// Admin-only (enforced by requireRole in the router). This is the
// orchestration point: validates auditor/supervisor/plant exist and resolves
// the right denormalized strings, THEN hands fully-resolved data to
// auditsService, which never has to know users/plants exist.
async function createAndAssignAudit(req, res, next) {
    try {
        const dto = req.body;
        const auditor = await usersService.getUserById(dto.auditorId);
        if (!auditor) {
            throw new domain_error_1.NotFoundError(`Auditor ${dto.auditorId} not found`);
        }
        if (auditor.role !== 'Auditor') {
            throw new domain_error_1.DomainError(`User ${dto.auditorId} is not an Auditor`, 400);
        }
        let supervisor = null;
        if (dto.supervisorId) {
            supervisor = await usersService.getUserById(dto.supervisorId);
            if (!supervisor) {
                throw new domain_error_1.NotFoundError(`Supervisor ${dto.supervisorId} not found`);
            }
        }
        const plant = await plantsService.getPlantById(dto.plantId);
        if (!plant) {
            throw new domain_error_1.NotFoundError(`Plant ${dto.plantId} not found`);
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
            auditorLogin: auditor.email,
            auditorFullName: auditor.full_name,
            supervisorId: supervisor?.id,
            supervisorName: supervisor?.full_name,
            supervisorLogin: supervisor?.email,
            startDate: dto.startDate,
            plantId: plant.id,
            matricule: dto.matricule,
            scheduleId: dto.scheduleId,
        });
        res.status(201).json({ audit });
    }
    catch (err) {
        next(err);
    }
}
// Admin-only. Same orchestration shape as above, smaller scope.
async function reassignAuditor(req, res, next) {
    try {
        const auditId = Number(req.params.id);
        const { auditorId: newAuditorId } = req.body;
        const auditor = await usersService.getUserById(newAuditorId);
        if (!auditor) {
            throw new domain_error_1.NotFoundError(`Auditor ${newAuditorId} not found`);
        }
        if (auditor.role !== 'Auditor') {
            throw new domain_error_1.DomainError(`User ${newAuditorId} is not an Auditor`, 400);
        }
        const audit = await auditsService.reassignAuditor(auditId, auditor.id, auditor.email, auditor.full_name);
        res.json({ audit });
    }
    catch (err) {
        next(err);
    }
}
async function bulkCreateDetails(req, res, next) {
    try {
        const auditId = Number(req.params.id);
        const items = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            throw new domain_error_1.DomainError('Request body must be a non-empty array of detail items', 400);
        }
        for (const item of items) {
            if (typeof item.groupPosition !== 'number' ||
                typeof item.questionPosition !== 'number' ||
                !item.groupName ||
                !item.groupNameEng ||
                !item.question ||
                !item.questionEng) {
                throw new domain_error_1.DomainError('Each detail item must have groupPosition, groupName, groupNameEng, questionPosition, question, questionEng', 400);
            }
        }
        const details = await auditsService.createBulkDetails(auditId, items);
        res.status(201).json({ details });
    }
    catch (err) {
        next(err);
    }
}
// Admin dashboard overview — list all audits with derived status. No
// per-audit auditor lookup needed here since auditorFullName is already
// denormalized onto the Audit row from creation time.
async function getDashboardAudits(req, res, next) {
    try {
        const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
        const status = req.query.status;
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
    }
    catch (err) {
        next(err);
    }
}
