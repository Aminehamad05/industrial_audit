import { prisma } from "./prisma";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌱 Starting seed process...\n");

  try {
    // 1. Create Plants
    console.log("📍 Creating plants...");
    const plant1 = await prisma.plant.upsert({
      where: { idPlant: 1 },
      update: {},
      create: { idPlant: 1, designationPlant: "FMS-Alpha" },
    });

    const plant2 = await prisma.plant.upsert({
      where: { idPlant: 2 },
      update: {},
      create: { idPlant: 2, designationPlant: "FMS-Beta" },
    });

    const plant3 = await prisma.plant.upsert({
      where: { idPlant: 3 },
      update: {},
      create: { idPlant: 3, designationPlant: "A&D-Gamma" },
    });

    console.log(
      `✅ Created/Updated plants: ${plant1.designationPlant}, ${plant2.designationPlant}, ${plant3.designationPlant}\n`
    );

    // 2. Create Users (aspnet_Users)
    console.log("👤 Creating users...");
    const adminId = randomUUID();
    const auditor1Id = randomUUID();
    const auditor2Id = randomUUID();
    const supervisorId = randomUUID();

    const admin = await prisma.aspnet_Users.upsert({
      where: { UserId: adminId },
      update: {},
      create: {
        UserId: adminId,
        ApplicationId: null,
        UserName: "admin",
        LoweredUserName: "admin",
        Email: "admin@auditsystem.com",
        LoweredEmail: "admin@auditsystem.com",
        Name: "System Administrator",
        LastName: "Administrator",
        IsAnonymous: false,
        LastActivityDate: new Date(),
      },
    });

    const auditor1 = await prisma.aspnet_Users.upsert({
      where: { UserId: auditor1Id },
      update: {},
      create: {
        UserId: auditor1Id,
        ApplicationId: null,
        UserName: "auditor1",
        LoweredUserName: "auditor1",
        Email: "auditor1@auditsystem.com",
        LoweredEmail: "auditor1@auditsystem.com",
        Name: "Ahmed",
        LastName: "Auditor",
        IsAnonymous: false,
        LastActivityDate: new Date(),
      },
    });

    const auditor2 = await prisma.aspnet_Users.upsert({
      where: { UserId: auditor2Id },
      update: {},
      create: {
        UserId: auditor2Id,
        ApplicationId: null,
        UserName: "auditor2",
        LoweredUserName: "auditor2",
        Email: "auditor2@auditsystem.com",
        LoweredEmail: "auditor2@auditsystem.com",
        Name: "Fatima",
        LastName: "Auditor",
        IsAnonymous: false,
        LastActivityDate: new Date(),
      },
    });

    const supervisor = await prisma.aspnet_Users.upsert({
      where: { UserId: supervisorId },
      update: {},
      create: {
        UserId: supervisorId,
        ApplicationId: null,
        UserName: "supervisor",
        LoweredUserName: "supervisor",
        Email: "supervisor@auditsystem.com",
        LoweredEmail: "supervisor@auditsystem.com",
        Name: "Karim",
        LastName: "Supervisor",
        IsAnonymous: false,
        LastActivityDate: new Date(),
      },
    });

    console.log(
      `✅ Created/Updated users: ${admin.UserName}, ${auditor1.UserName}, ${auditor2.UserName}, ${supervisor.UserName}\n`
    );

    // 3. Create Audits
    console.log("📋 Creating audits...");
    const audit1 = await prisma.audits.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        auditType: "SAFETY",
        auditTypeName: "Safety Audit",
        auditTarget: "Production Line A",
        auditTargetArea: "Zone 1",
        auditTargetSection: "Section 1",
        auditorLogin: "auditor1",
        auditorFullName: "Ahmed Auditor",
        supervisorName: "Karim Supervisor",
        supervisorLogin: "supervisor",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-02"),
        score: 85.5,
        comment: "Good safety practices observed",
        plantId: plant1.idPlant,
      },
    });

    const audit2 = await prisma.audits.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        auditType: "MAINTENANCE",
        auditTypeName: "Preventive Maintenance Audit",
        auditTarget: "Equipment Zone B",
        auditTargetArea: "Zone 2",
        auditTargetSection: "Section 2",
        auditorLogin: "auditor2",
        auditorFullName: "Fatima Auditor",
        supervisorName: "Karim Supervisor",
        supervisorLogin: "supervisor",
        startDate: new Date("2026-06-10"),
        endDate: new Date("2026-06-11"),
        score: 78.0,
        comment: "Some maintenance tasks overdue",
        plantId: plant2.idPlant,
      },
    });

    const audit3 = await prisma.audits.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        auditType: "COMPLIANCE",
        auditTypeName: "Compliance Audit",
        auditTarget: "Operations Center",
        auditTargetArea: "Central",
        auditTargetSection: "Admin",
        auditorLogin: "auditor1",
        auditorFullName: "Ahmed Auditor",
        supervisorName: "Karim Supervisor",
        supervisorLogin: "supervisor",
        startDate: new Date("2026-06-15"),
        comment: "Compliance check in progress",
        plantId: plant3.idPlant,
      },
    });

    console.log(
      `✅ Created/Updated audits: ${audit1.auditTypeName}, ${audit2.auditTypeName}, ${audit3.auditTypeName}\n`
    );

    // 4. Create Audit Details
    console.log("📝 Creating audit details...");
    const details = [];

    // Details for Audit 1
    for (let i = 1; i <= 5; i++) {
      const detail = await prisma.audit_details.upsert({
        where: { id: (i - 1) * 10 + 1 },
        update: {},
        create: {
          id: (i - 1) * 10 + 1,
          auditId: audit1.id,
          groupPosition: 1,
          groupName: "Safety Equipment",
          groupNameEng: "Safety Equipment",
          questionPosition: i,
          question: `صورة السؤال ${i} - هل المعدات الأمنية موجودة؟`,
          questionEng: `Safety Question ${i} - Are safety equipment present?`,
          answer: "نعم",
          comment: "All equipment in place",
          answerOk: i % 2 === 1,
          answerNok: i % 2 === 0,
          answerNc: false,
          answerNa: false,
          plantId: plant1.idPlant,
        },
      });
      details.push(detail);
    }

    // Details for Audit 2
    for (let i = 1; i <= 5; i++) {
      const detail = await prisma.audit_details.upsert({
        where: { id: (i - 1) * 10 + 51 },
        update: {},
        create: {
          id: (i - 1) * 10 + 51,
          auditId: audit2.id,
          groupPosition: 1,
          groupName: "Maintenance Schedule",
          groupNameEng: "Maintenance Schedule",
          questionPosition: i,
          question: `صورة السؤال ${i} - هل الصيانة محدثة؟`,
          questionEng: `Maintenance Question ${i} - Is maintenance up to date?`,
          answer: i <= 3 ? "نعم" : "لا",
          comment: i <= 3 ? "Maintained" : "Needs attention",
          answerOk: i <= 3,
          answerNok: i > 3,
          answerNc: false,
          answerNa: false,
          plantId: plant2.idPlant,
        },
      });
      details.push(detail);
    }

    console.log(`✅ Created/Updated ${details.length} audit details\n`);

    // 5. Create Action Statuses
    console.log("⚙️  Creating action statuses...");
    const statusOpen = await prisma.setts_action_status.upsert({
      where: { id_status: 1 },
      update: {},
      create: { id_status: 1, etat_status: "Open" },
    });

    const statusInProgress = await prisma.setts_action_status.upsert({
      where: { id_status: 2 },
      update: {},
      create: { id_status: 2, etat_status: "In Progress" },
    });

    const statusClosed = await prisma.setts_action_status.upsert({
      where: { id_status: 3 },
      update: {},
      create: { id_status: 3, etat_status: "Closed" },
    });

    console.log(
      `✅ Created/Updated action statuses: ${statusOpen.etat_status}, ${statusInProgress.etat_status}, ${statusClosed.etat_status}\n`
    );

    // 6. Create Actions
    console.log("✅ Creating actions...");
    const actions = [];

    for (let i = 1; i <= 3; i++) {
      const action = await prisma.actions.upsert({
        where: { id: i },
        update: {},
        create: {
          id: i,
          auditId: audit1.id,
          auditDetailId: details[i - 1].id,
          statusId: i === 1 ? 1 : i === 2 ? 2 : 3,
          responsibleLogin: auditor1.UserName || "auditor1",
          responsibleFullName: auditor1.Name || "Ahmed",
          description: `Action ${i}: ${i === 1 ? "Fix safety equipment" : i === 2 ? "Update procedures" : "Close audit"}`,
          plannedTerm: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000),
          cause: "Audit finding",
          plantId: plant1.idPlant,
        },
      });
      actions.push(action);
    }

    console.log(`✅ Created/Updated ${actions.length} actions\n`);

    // 7. Create Schedules
    console.log("📅 Creating schedules...");
    const schedule1 = await prisma.schedules.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        scheduleName: "Monthly Safety Audit",
        auditType: "SAFETY",
        auditTarget: "Production Line",
        auditDate: new Date("2026-07-01"),
        auditYear: 2026,
        auditMonth: 7,
        auditor_login: "auditor1",
        plantId: plant1.idPlant,
      },
    });

    const schedule2 = await prisma.schedules.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        scheduleName: "Quarterly Maintenance Check",
        auditType: "MAINTENANCE",
        auditTarget: "Equipment Zone",
        auditDate: new Date("2026-07-15"),
        auditYear: 2026,
        auditMonth: 7,
        auditor_login: "auditor2",
        plantId: plant2.idPlant,
      },
    });

    const schedule3 = await prisma.schedules.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        scheduleName: "Annual Compliance Review",
        auditType: "COMPLIANCE",
        auditTarget: "Operations",
        auditDate: new Date("2026-08-01"),
        auditYear: 2026,
        auditMonth: 8,
        auditor_login: "supervisor",
        plantId: plant3.idPlant,
      },
    });

    console.log(
      `✅ Created/Updated schedules: ${schedule1.scheduleName}, ${schedule2.scheduleName}, ${schedule3.scheduleName}\n`
    );

    // 8. Create Audit Types
    console.log("🏷️  Creating audit types...");
    const auditType1 = await prisma.setts_audit_types.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, audit_type: "SAFETY", name: "Safety Audit" },
    });

    const auditType2 = await prisma.setts_audit_types.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, audit_type: "MAINTENANCE", name: "Maintenance Audit" },
    });

    const auditType3 = await prisma.setts_audit_types.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, audit_type: "COMPLIANCE", name: "Compliance Audit" },
    });

    console.log(
      `✅ Created/Updated audit types: ${auditType1.name}, ${auditType2.name}, ${auditType3.name}\n`
    );

    // 9. Create Question Groups
    console.log("❓ Creating audit question groups...");
    const group1 = await prisma.setts_audit_question_groups.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        audit_type: "SAFETY",
        group_position: 1,
        group_name: "Personal Protective Equipment",
        group_name_ENG: "Personal Protective Equipment",
      },
    });

    const group2 = await prisma.setts_audit_question_groups.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        audit_type: "MAINTENANCE",
        group_position: 1,
        group_name: "Equipment Condition",
        group_name_ENG: "Equipment Condition",
      },
    });

    console.log(
      `✅ Created/Updated audit question groups: ${group1.group_name}, ${group2.group_name}\n`
    );

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Data Summary:");
    console.log(`   • Plants: 3`);
    console.log(`   • Users: 4 (admin, 2 auditors, 1 supervisor)`);
    console.log(`   • Audits: 3`);
    console.log(`   • Audit Details: ${details.length}`);
    console.log(`   • Actions: ${actions.length}`);
    console.log(`   • Schedules: 3`);
    console.log(`   • Audit Types: 3`);
    console.log(`   • Question Groups: 2`);
    console.log("\n🔐 Test Credentials:");
    console.log(`   Admin:      ${admin.UserName} / admin@auditsystem.com`);
    console.log(`   Auditor 1:  ${auditor1.UserName} / auditor1@auditsystem.com`);
    console.log(`   Auditor 2:  ${auditor2.UserName} / auditor2@auditsystem.com`);
    console.log(`   Supervisor: ${supervisor.UserName} / supervisor@auditsystem.com\n`);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
