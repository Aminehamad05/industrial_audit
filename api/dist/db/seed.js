"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("./prisma");
const BCRYPT_ROUNDS = 12;
async function seed() {
    console.log("Seeding database...");
    const openStatus = await prisma_1.prisma.action_statuses.create({ data: { label: "Open" } });
    const inProgressStatus = await prisma_1.prisma.action_statuses.create({ data: { label: "In Progress" } });
    const closedStatus = await prisma_1.prisma.action_statuses.create({ data: { label: "Closed" } });
    console.log("Action statuses seeded.");
    const fms1 = await prisma_1.prisma.plants.create({ data: { family: "FMS", designation: "FMS1" } });
    const fms2 = await prisma_1.prisma.plants.create({ data: { family: "FMS", designation: "FMS2" } });
    const fms3 = await prisma_1.prisma.plants.create({ data: { family: "FMS", designation: "FMS3" } });
    const ad1 = await prisma_1.prisma.plants.create({ data: { family: "A&D", designation: "A&D1" } });
    const ad2 = await prisma_1.prisma.plants.create({ data: { family: "A&D", designation: "A&D2" } });
    console.log("Plants seeded.");
    const adminPassword = await bcryptjs_1.default.hash("amine2005", BCRYPT_ROUNDS);
    const auditorPassword = await bcryptjs_1.default.hash("password123", BCRYPT_ROUNDS);
    await prisma_1.prisma.users.create({
        data: {
            username: "amine",
            email: "amine@test.com",
            password_hash: adminPassword,
            full_name: "Amine Administrator",
            role: "Administrator",
            account_status: "Active",
        },
    });
    const auditor1 = await prisma_1.prisma.users.create({
        data: {
            username: "auditor1",
            email: "auditor1@test.com",
            password_hash: auditorPassword,
            full_name: "Ahmed Auditor",
            role: "Auditor",
            account_status: "Active",
            plant_id: fms1.id,
        },
    });
    const auditor2 = await prisma_1.prisma.users.create({
        data: {
            username: "auditor2",
            email: "auditor2@test.com",
            password_hash: auditorPassword,
            full_name: "Sami Auditor",
            role: "Auditor",
            account_status: "Active",
            plant_id: ad1.id,
        },
    });
    const supervisor = await prisma_1.prisma.users.create({
        data: {
            username: "supervisor1",
            email: "supervisor1@test.com",
            password_hash: auditorPassword,
            full_name: "Karim Supervisor",
            role: "MaintenanceTechnician",
            account_status: "Active",
            plant_id: fms2.id,
        },
    });
    console.log("Users seeded.");
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const week = Math.ceil(now.getDate() / 7);
    const schedule1 = await prisma_1.prisma.schedules.create({
        data: {
            scheduleName: "FMS1 Weekly Safety Audit",
            auditType: "SAFETY",
            auditTarget: "Production Line A",
            auditDate: now,
            auditYear: year,
            auditMonth: month,
            auditWeek: week,
            auditorId: auditor1.id,
            plantId: fms1.id,
            status: "Planned",
        },
    });
    const schedule2 = await prisma_1.prisma.schedules.create({
        data: {
            scheduleName: "A&D1 Quality Check",
            auditType: "QUALITY",
            auditTarget: "Assembly Area B",
            auditDate: new Date(now.getTime() + 7 * 86400000),
            auditYear: year,
            auditMonth: month,
            auditWeek: week + 1,
            auditorId: auditor2.id,
            plantId: ad1.id,
            status: "Planned",
        },
    });
    const schedule3 = await prisma_1.prisma.schedules.create({
        data: {
            scheduleName: "FMS2 Maintenance Review",
            auditType: "MAINTENANCE",
            auditTarget: "Equipment Zone C",
            auditDate: new Date(now.getTime() - 7 * 86400000),
            auditYear: year,
            auditMonth: month - 1,
            auditWeek: week - 1,
            auditorId: auditor1.id,
            plantId: fms2.id,
            status: "Completed",
        },
    });
    console.log("Schedules seeded.");
    const audit1 = await prisma_1.prisma.audits.create({
        data: {
            auditType: "SAFETY",
            auditTypeName: "Safety Inspection",
            auditTarget: "Production Line A",
            auditTargetArea: "Line A",
            auditTargetSubarea: "Station 3",
            auditorId: auditor1.id,
            auditorLogin: auditor1.username,
            auditorFullName: auditor1.full_name,
            supervisorId: supervisor.id,
            supervisorName: supervisor.full_name,
            supervisorLogin: supervisor.username,
            startDate: new Date(now.getTime() - 14 * 86400000),
            endDate: new Date(now.getTime() - 12 * 86400000),
            score: 87.5,
            comment: "Good overall, minor issues found",
            plantId: fms1.id,
            scheduleId: schedule1.id,
        },
    });
    const audit2 = await prisma_1.prisma.audits.create({
        data: {
            auditType: "QUALITY",
            auditTypeName: "Quality Control",
            auditTarget: "Assembly Area B",
            auditTargetArea: "Area B",
            auditorId: auditor2.id,
            auditorLogin: auditor2.username,
            auditorFullName: auditor2.full_name,
            startDate: new Date(now.getTime() - 5 * 86400000),
            plantId: ad1.id,
            matricule: "MTR-001",
        },
    });
    const audit3 = await prisma_1.prisma.audits.create({
        data: {
            auditType: "MAINTENANCE",
            auditTypeName: "Preventive Maintenance",
            auditTarget: "Equipment Zone C",
            auditTargetArea: "Zone C",
            auditTargetSection: "Section 2",
            auditorId: auditor1.id,
            auditorLogin: auditor1.username,
            auditorFullName: auditor1.full_name,
            supervisorId: supervisor.id,
            supervisorName: supervisor.full_name,
            supervisorLogin: supervisor.username,
            startDate: new Date(now.getTime() + 3 * 86400000),
            plantId: fms2.id,
        },
    });
    console.log("Audits seeded.");
    const detail1 = await prisma_1.prisma.audit_details.create({
        data: {
            auditId: audit1.id,
            groupPosition: 1,
            groupName: "Workplace Organization",
            groupNameEng: "Workplace Organization",
            questionPosition: 1,
            question: "Are workstations clean and organized?",
            questionEng: "Are workstations clean and organized?",
            answer: "Yes",
            answerOk: true,
            plantId: fms1.id,
        },
    });
    await prisma_1.prisma.audit_details.create({
        data: {
            auditId: audit1.id,
            groupPosition: 1,
            groupName: "Workplace Organization",
            groupNameEng: "Workplace Organization",
            questionPosition: 2,
            question: "Are safety signs visible?",
            questionEng: "Are safety signs visible?",
            answer: "No",
            comment: "Signs faded near exit door",
            answerNok: true,
            plantId: fms1.id,
        },
    });
    await prisma_1.prisma.audit_details.create({
        data: {
            auditId: audit2.id,
            groupPosition: 1,
            groupName: "Assembly Quality",
            groupNameEng: "Assembly Quality",
            questionPosition: 1,
            question: "Are torque values within spec?",
            questionEng: "Are torque values within spec?",
            answerOk: true,
            plantId: ad1.id,
        },
    });
    console.log("Audit details seeded.");
    await prisma_1.prisma.actions.create({
        data: {
            auditId: audit1.id,
            auditDetailId: detail1.id,
            statusId: closedStatus.id,
            responsibleUserId: supervisor.id,
            responsibleLogin: supervisor.username,
            responsibleFullName: supervisor.full_name,
            description: "Replace faded safety signs at exit door",
            plannedTerm: new Date(now.getTime() - 5 * 86400000),
            term: new Date(now.getTime() - 3 * 86400000),
            lastEditDate: new Date(now.getTime() - 3 * 86400000),
            lastEditedByUser: supervisor.username,
            plantId: fms1.id,
            cause: "Weather exposure",
        },
    });
    console.log("Actions seeded.");
    console.log("\n--- Seed complete ---");
    console.log("Admin login:  amine@test.com / amine2005");
    console.log("Auditor 1:    auditor1@test.com / password123");
    console.log("Auditor 2:    auditor2@test.com / password123");
    console.log("Supervisor:   supervisor1@test.com / password123");
}
seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
