import "reflect-metadata";
import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { User } from "../modules/users/user.entity";
import { Plant } from "../modules/plants/enitites/plant.entities";
import { Audit } from "../modules/audits/entitites/Audit";
import { AuditDetail } from "../modules/audits/entitites/AuditDetail";
import { Action } from "../modules/audits/entitites/Action";
import { ActionStatus } from "../modules/audits/entitites/ActionStatus";
import { Schedule } from "../modules/audits/entitites/Schedule";
import { ScheduleStatus } from "../modules/audits/entitites/Schedule";

const BCRYPT_ROUNDS = 12;

const seedDataSource = new DataSource({
  type: "mssql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: true,
  dropSchema: true,
  logging: false,
  entities: [User, Plant, Audit, AuditDetail, Action, ActionStatus, Schedule],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

async function seed() {
  console.log("Dropping old schema and creating new one...");
  await seedDataSource.initialize();
  console.log("Database synced.");

  // ---- Action statuses ----
  const actionStatusRepo = seedDataSource.getRepository(ActionStatus);
  const openStatus = await actionStatusRepo.save({ label: "Open" });
  const inProgressStatus = await actionStatusRepo.save({ label: "In Progress" });
  const closedStatus = await actionStatusRepo.save({ label: "Closed" });
  console.log("Action statuses seeded.");

  // ---- Plants ----
  const plantRepo = seedDataSource.getRepository(Plant);
  const fms1 = await plantRepo.save({ family: "FMS", designation: "FMS1" });
  const fms2 = await plantRepo.save({ family: "FMS", designation: "FMS2" });
  const fms3 = await plantRepo.save({ family: "FMS", designation: "FMS3" });
  const ad1 = await plantRepo.save({ family: "A&D", designation: "A&D1" });
  const ad2 = await plantRepo.save({ family: "A&D", designation: "A&D2" });
  console.log("Plants seeded.");

  // ---- Users ----
  const userRepo = seedDataSource.getRepository(User);

  const adminPassword = await bcrypt.hash("amine2005", BCRYPT_ROUNDS);
  const auditorPassword = await bcrypt.hash("password123", BCRYPT_ROUNDS);

  const admin = await userRepo.save({
    username: "amine",
    email: "amine@test.com",
    passwordHash: adminPassword,
    fullName: "Amine Administrator",
    role: "Administrator",
    accountStatus: "Active",
    plant: null,
  });

  const auditor1 = await userRepo.save({
    username: "auditor1",
    email: "auditor1@test.com",
    passwordHash: auditorPassword,
    fullName: "Ahmed Auditor",
    role: "Auditor",
    accountStatus: "Active",
    plant: fms1,
  });

  const auditor2 = await userRepo.save({
    username: "auditor2",
    email: "auditor2@test.com",
    passwordHash: auditorPassword,
    fullName: "Sami Auditor",
    role: "Auditor",
    accountStatus: "Active",
    plant: ad1,
  });

  const supervisor = await userRepo.save({
    username: "supervisor1",
    email: "supervisor1@test.com",
    passwordHash: auditorPassword,
    fullName: "Karim Supervisor",
    role: "MaintenanceTechnician",
    accountStatus: "Active",
    plant: fms2,
  });

  console.log("Users seeded.");

  // ---- Schedules ----
  const scheduleRepo = seedDataSource.getRepository(Schedule);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const week = Math.ceil(now.getDate() / 7);

  const schedule1 = await scheduleRepo.save({
    scheduleName: "FMS1 Weekly Safety Audit",
    auditType: "SAFETY",
    auditTarget: "Production Line A",
    auditDate: now,
    auditYear: year,
    auditMonth: month,
    auditWeek: week,
    auditor: auditor1,
    auditorId: auditor1.id,
    plant: fms1,
    plantId: fms1.id,
    status: ScheduleStatus.PLANNED,
  });

  const schedule2 = await scheduleRepo.save({
    scheduleName: "A&D1 Quality Check",
    auditType: "QUALITY",
    auditTarget: "Assembly Area B",
    auditDate: new Date(now.getTime() + 7 * 86400000),
    auditYear: year,
    auditMonth: month,
    auditWeek: week + 1,
    auditor: auditor2,
    auditorId: auditor2.id,
    plant: ad1,
    plantId: ad1.id,
    status: ScheduleStatus.PLANNED,
  });

  const schedule3 = await scheduleRepo.save({
    scheduleName: "FMS2 Maintenance Review",
    auditType: "MAINTENANCE",
    auditTarget: "Equipment Zone C",
    auditDate: new Date(now.getTime() - 7 * 86400000),
    auditYear: year,
    auditMonth: month - 1,
    auditWeek: week - 1,
    auditor: auditor1,
    auditorId: auditor1.id,
    plant: fms2,
    plantId: fms2.id,
    status: ScheduleStatus.COMPLETED,
  });

  console.log("Schedules seeded.");

  // ---- Audits ----
  const auditRepo = seedDataSource.getRepository(Audit);

  const audit1 = await auditRepo.save({
    auditType: "SAFETY",
    auditTypeName: "Safety Inspection",
    auditTarget: "Production Line A",
    auditTargetArea: "Line A",
    auditTargetSubarea: "Station 3",
    auditor: auditor1,
    auditorId: auditor1.id,
    auditorLogin: auditor1.username,
    auditorFullName: auditor1.fullName,
    supervisor: supervisor,
    supervisorId: supervisor.id,
    supervisorName: supervisor.fullName,
    supervisorLogin: supervisor.username,
    startDate: new Date(now.getTime() - 14 * 86400000),
    endDate: new Date(now.getTime() - 12 * 86400000),
    score: 87.5,
    comment: "Good overall, minor issues found",
    plant: fms1,
    plantId: fms1.id,
    schedule: schedule1,
    scheduleId: schedule1.id,
  });

  const audit2 = await auditRepo.save({
    auditType: "QUALITY",
    auditTypeName: "Quality Control",
    auditTarget: "Assembly Area B",
    auditTargetArea: "Area B",
    auditor: auditor2,
    auditorId: auditor2.id,
    auditorLogin: auditor2.username,
    auditorFullName: auditor2.fullName,
    startDate: new Date(now.getTime() - 5 * 86400000),
    endDate: null,
    score: null,
    comment: null,
    plant: ad1,
    plantId: ad1.id,
    matricule: "MTR-001",
  });

  const audit3 = await auditRepo.save({
    auditType: "MAINTENANCE",
    auditTypeName: "Preventive Maintenance",
    auditTarget: "Equipment Zone C",
    auditTargetArea: "Zone C",
    auditTargetSection: "Section 2",
    auditor: auditor1,
    auditorId: auditor1.id,
    auditorLogin: auditor1.username,
    auditorFullName: auditor1.fullName,
    supervisor: supervisor,
    supervisorId: supervisor.id,
    supervisorName: supervisor.fullName,
    supervisorLogin: supervisor.username,
    startDate: new Date(now.getTime() + 3 * 86400000),
    endDate: null,
    score: null,
    comment: null,
    plant: fms2,
    plantId: fms2.id,
  });

  console.log("Audits seeded.");

  // ---- Audit details ----
  const auditDetailRepo = seedDataSource.getRepository(AuditDetail);
  const detail1 = await auditDetailRepo.save({
    audit: audit1,
    auditId: audit1.id,
    groupPosition: 1,
    groupName: "Workplace Organization",
    groupNameEng: "Workplace Organization",
    questionPosition: 1,
    question: "Are workstations clean and organized?",
    questionEng: "Are workstations clean and organized?",
    answer: "Yes",
    comment: null,
    answerOk: true,
    answerNok: false,
    answerNc: false,
    answerNa: false,
    plant: fms1,
    plantId: fms1.id,
  });
  const detail2 = await auditDetailRepo.save({
    audit: audit1,
    auditId: audit1.id,
    groupPosition: 1,
    groupName: "Workplace Organization",
    groupNameEng: "Workplace Organization",
    questionPosition: 2,
    question: "Are safety signs visible?",
    questionEng: "Are safety signs visible?",
    answer: "No",
    comment: "Signs faded near exit door",
    answerOk: false,
    answerNok: true,
    answerNc: false,
    answerNa: false,
    plant: fms1,
    plantId: fms1.id,
  });
  await auditDetailRepo.save({
    audit: audit2,
    auditId: audit2.id,
    groupPosition: 1,
    groupName: "Assembly Quality",
    groupNameEng: "Assembly Quality",
    questionPosition: 1,
    question: "Are torque values within spec?",
    questionEng: "Are torque values within spec?",
    answer: null,
    comment: null,
    answerOk: true,
    answerNok: false,
    answerNc: false,
    answerNa: false,
    plant: ad1,
    plantId: ad1.id,
  });
  console.log("Audit details seeded.");

  // ---- Actions ----
  const actionRepo = seedDataSource.getRepository(Action);
  await actionRepo.save({
    audit: audit1,
    auditId: audit1.id,
    auditDetail: detail1,
    auditDetailId: detail1.id,
    status: closedStatus,
    statusId: closedStatus.id,
    responsibleUser: supervisor,
    responsibleUserId: supervisor.id,
    responsibleLogin: supervisor.username,
    responsibleFullName: supervisor.fullName,
    description: "Replace faded safety signs at exit door",
    plannedTerm: new Date(now.getTime() - 5 * 86400000),
    term: new Date(now.getTime() - 3 * 86400000),
    lastEditDate: new Date(now.getTime() - 3 * 86400000),
    lastEditedByUser: supervisor.username,
    plant: fms1,
    plantId: fms1.id,
    cause: "Weather exposure",
  });
  console.log("Actions seeded.");

  console.log("\n--- Seed complete ---");
  console.log("Admin login:  amine@test.com / amine2005");
  console.log("Auditor 1:    auditor1@test.com / password123");
  console.log("Auditor 2:    auditor2@test.com / password123");
  console.log("Supervisor:   supervisor1@test.com / password123");

  await seedDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
