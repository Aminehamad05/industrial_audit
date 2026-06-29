"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAudits = listAudits;
exports.getAuditById = getAuditById;
exports.createAudit = createAudit;
exports.reassignAuditor = reassignAuditor;
exports.updateAuditResult = updateAuditResult;
exports.createBulkDetails = createBulkDetails;
exports.deriveAuditStatus = deriveAuditStatus;
const prisma_1 = require("../../db/prisma");
const domain_error_1 = require("../../shared/errors/domain-error");
async function listAudits(filters) {
    const where = {};
    if (filters.auditorId) {
        where.auditorId = filters.auditorId;
    }
    if (filters.plantId) {
        where.plantId = filters.plantId;
    }
    const now = new Date();
    if (filters.status === 'upcoming') {
        where.startDate = { gt: now };
        where.endDate = null;
    }
    else if (filters.status === 'in_progress') {
        where.startDate = { lte: now };
        where.endDate = null;
    }
    else if (filters.status === 'completed') {
        where.endDate = { not: null };
    }
    return prisma_1.prisma.audits.findMany({
        where: where,
        orderBy: { startDate: 'desc' },
    });
}
async function getAuditById(auditId) {
    const audit = await prisma_1.prisma.audits.findUnique({
        where: { id: auditId },
        include: {
            audit_details: true,
            actions: true,
        },
    });
    if (!audit) {
        throw new domain_error_1.NotFoundError(`Audit ${auditId} not found`);
    }
    return audit;
}
async function createAudit(dto) {
    return prisma_1.prisma.audits.create({
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
async function reassignAuditor(auditId, newAuditorId, newAuditorLogin, newAuditorFullName) {
    const audit = await prisma_1.prisma.audits.findUnique({ where: { id: auditId } });
    if (!audit) {
        throw new domain_error_1.NotFoundError(`Audit ${auditId} not found`);
    }
    return prisma_1.prisma.audits.update({
        where: { id: auditId },
        data: {
            auditorId: newAuditorId,
            auditorLogin: newAuditorLogin,
            auditorFullName: newAuditorFullName,
        },
    });
}
async function updateAuditResult(auditId, dto) {
    const audit = await prisma_1.prisma.audits.findUnique({ where: { id: auditId } });
    if (!audit) {
        throw new domain_error_1.NotFoundError(`Audit ${auditId} not found`);
    }
    return prisma_1.prisma.audits.update({
        where: { id: auditId },
        data: {
            ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
            ...(dto.score !== undefined && { score: dto.score }),
            ...(dto.comment !== undefined && { comment: dto.comment }),
        },
    });
}
async function createBulkDetails(auditId, items) {
    const audit = await prisma_1.prisma.audits.findUnique({ where: { id: auditId } });
    if (!audit) {
        throw new domain_error_1.NotFoundError(`Audit ${auditId} not found`);
    }
    await prisma_1.prisma.audit_details.createMany({
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
    return prisma_1.prisma.audit_details.findMany({ where: { auditId } });
}
function deriveAuditStatus(audit) {
    const now = new Date();
    const start = new Date(audit.startDate);
    if (audit.endDate)
        return 'Completed';
    if ((audit.detailsCount ?? 0) === 0 && start < now) {
        return 'Missed';
    }
    if ((audit.detailsCount ?? 0) > 0) {
        return 'InProgress';
    }
    return 'Upcoming';
}
