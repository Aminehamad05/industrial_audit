import { prisma } from "./prisma";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

async function seed() {
  console.log("🌱 Starting seed process...\n");

  try {
    // 1. Create Plants (auto-increment, so don't specify IDs)
    console.log("📍 Creating plants...");
    
    // First check if plants exist
    const plantCount = await prisma.plant.count();
    let plant1, plant2, plant3;
    
    if (plantCount === 0) {
      plant1 = await prisma.plant.create({
        data: { designationPlant: "FMS-Alpha" },
      });
      plant2 = await prisma.plant.create({
        data: { designationPlant: "FMS-Beta" },
      });
      plant3 = await prisma.plant.create({
        data: { designationPlant: "A&D-Gamma" },
      });
      console.log(
        `✅ Created plants: ${plant1.designationPlant}, ${plant2.designationPlant}, ${plant3.designationPlant}\n`
      );
    } else {
      // Get existing plants
      const plants = await prisma.plant.findMany({ take: 3 });
      [plant1, plant2, plant3] = plants;
      console.log(`✅ Using existing plants\n`);
    }

    // 2. Create Users (aspnet_Users)
    console.log("👤 Creating users...");
    const adminId = "550e8400-e29b-41d4-a716-446655440001";
    const auditor1Id = "550e8400-e29b-41d4-a716-446655440002";
    const auditor2Id = "550e8400-e29b-41d4-a716-446655440003";
    const supervisorId = "550e8400-e29b-41d4-a716-446655440004";

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash("admin123", BCRYPT_ROUNDS);
    const auditor1PasswordHash = await bcrypt.hash("auditor123", BCRYPT_ROUNDS);
    const auditor2PasswordHash = await bcrypt.hash("auditor123", BCRYPT_ROUNDS);
    const supervisorPasswordHash = await bcrypt.hash("supervisor123", BCRYPT_ROUNDS);

    const admin = await prisma.aspnet_Users.upsert({
      where: { UserId: adminId },
      update: { passwordHash: adminPasswordHash },
      create: {
        UserId: adminId,
        UserName: "admin",
        LoweredUserName: "admin",
        Email: "admin@auditsystem.com",
        Name: "System",
        LastName: "Administrator",
        IsAnonymous: false,
        LastActivityDate: new Date(),
        passwordHash: adminPasswordHash,
      },
    });

    const auditor1 = await prisma.aspnet_Users.upsert({
      where: { UserId: auditor1Id },
      update: { passwordHash: auditor1PasswordHash },
      create: {
        UserId: auditor1Id,
        UserName: "auditor1",
        LoweredUserName: "auditor1",
        Email: "auditor1@auditsystem.com",
        Name: "Ahmed",
        LastName: "Auditor",
        IsAnonymous: false,
        LastActivityDate: new Date(),
        passwordHash: auditor1PasswordHash,
      },
    });

    const auditor2 = await prisma.aspnet_Users.upsert({
      where: { UserId: auditor2Id },
      update: { passwordHash: auditor2PasswordHash },
      create: {
        UserId: auditor2Id,
        UserName: "auditor2",
        LoweredUserName: "auditor2",
        Email: "auditor2@auditsystem.com",
        Name: "Fatima",
        LastName: "Auditor",
        IsAnonymous: false,
        LastActivityDate: new Date(),
        passwordHash: auditor2PasswordHash,
      },
    });

    const supervisor = await prisma.aspnet_Users.upsert({
      where: { UserId: supervisorId },
      update: { passwordHash: supervisorPasswordHash },
      create: {
        UserId: supervisorId,
        UserName: "supervisor",
        LoweredUserName: "supervisor",
        Email: "supervisor@auditsystem.com",
        Name: "Karim",
        LastName: "Supervisor",
        IsAnonymous: false,
        LastActivityDate: new Date(),
        passwordHash: supervisorPasswordHash,
      },
    });

    console.log(
      `✅ Created/Updated users: ${admin.UserName}, ${auditor1.UserName}, ${auditor2.UserName}, ${supervisor.UserName}\n`
    );

    // 3. Create Audits
    console.log("📋 Creating audits...");
    const auditCount = await prisma.audits.count();
    const audits = [];

    if (auditCount === 0) {
      const audit1 = await prisma.audits.create({
        data: {
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

      const audit2 = await prisma.audits.create({
        data: {
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

      const audit3 = await prisma.audits.create({
        data: {
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

      audits.push(audit1, audit2, audit3);
      console.log(
        `✅ Created audits: ${audit1.auditTypeName}, ${audit2.auditTypeName}, ${audit3.auditTypeName}\n`
      );
    } else {
      const existingAudits = await prisma.audits.findMany({ take: 3 });
      audits.push(...existingAudits);
      console.log(`✅ Using existing audits\n`);
    }

    // 4. Create Audit Details
    console.log("📝 Creating audit details...");
    const detailCount = await prisma.audit_details.count();
    const details = [];

    if (detailCount === 0 && audits.length > 0) {
      // Details for Audit 1
      for (let i = 1; i <= 5; i++) {
        const detail = await prisma.audit_details.create({
          data: {
            auditId: audits[0].id,
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
        const detail = await prisma.audit_details.create({
          data: {
            auditId: audits[1].id,
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

      console.log(`✅ Created ${details.length} audit details\n`);
    } else {
      const existingDetails = await prisma.audit_details.findMany({ take: 10 });
      details.push(...existingDetails);
      console.log(`✅ Using existing audit details\n`);
    }

    // 5. Create Action Statuses
    console.log("⚙️  Creating action statuses...");
    const statusCount = await prisma.setts_action_status.count();

    if (statusCount === 0) {
      const statusOpen = await prisma.setts_action_status.create({
        data: { id_status: 1, etat_status: "Open" },
      });

      const statusInProgress = await prisma.setts_action_status.create({
        data: { id_status: 2, etat_status: "In Progress" },
      });

      const statusClosed = await prisma.setts_action_status.create({
        data: { id_status: 3, etat_status: "Closed" },
      });

      console.log(
        `✅ Created action statuses: ${statusOpen.etat_status}, ${statusInProgress.etat_status}, ${statusClosed.etat_status}\n`
      );
    } else {
      console.log(`✅ Using existing action statuses\n`);
    }

    // Get action statuses for use in actions
    const statuses = await prisma.setts_action_status.findMany({ take: 3 });

    // 6. Create Actions
    console.log("✅ Creating actions...");
    const actionCount = await prisma.actions.count();
    const actions = [];

    if (actionCount === 0 && details.length > 0 && statuses.length > 0) {
      for (let i = 0; i < 3 && i < details.length; i++) {
        const action = await prisma.actions.create({
          data: {
            auditId: details[i].auditId,
            auditDetailId: details[i].id,
            statusId: statuses[i % statuses.length].id_status,
            responsibleLogin: auditor1.UserName || "auditor1",
            responsibleFullName: auditor1.Name || "Ahmed",
            description: `Action ${i + 1}: ${i === 0 ? "Fix safety equipment" : i === 1 ? "Update procedures" : "Close audit"}`,
            plannedTerm: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
            cause: "Audit finding",
            plantId: plant1.idPlant,
          },
        });
        actions.push(action);
      }

      console.log(`✅ Created ${actions.length} actions\n`);
    } else {
      const existingActions = await prisma.actions.findMany({ take: 3 });
      actions.push(...existingActions);
      console.log(`✅ Using existing actions\n`);
    }

    // 7. Create Schedules
    console.log("📅 Creating schedules...");
    const scheduleCount = await prisma.schedules.count();

    if (scheduleCount === 0) {
      const schedule1 = await prisma.schedules.create({
        data: {
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

      const schedule2 = await prisma.schedules.create({
        data: {
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

      const schedule3 = await prisma.schedules.create({
        data: {
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
        `✅ Created schedules: ${schedule1.scheduleName}, ${schedule2.scheduleName}, ${schedule3.scheduleName}\n`
      );
    } else {
      console.log(`✅ Using existing schedules\n`);
    }

    // 8. Create Audit Types
    console.log("🏷️  Creating audit types...");
    const typeCount = await prisma.setts_audit_types.count();

    if (typeCount === 0) {
      const auditType1 = await prisma.setts_audit_types.create({
        data: { audit_type: "SAFETY", name: "Safety Audit" },
      });

      const auditType2 = await prisma.setts_audit_types.create({
        data: { audit_type: "MAINTENANCE", name: "Maintenance Audit" },
      });

      const auditType3 = await prisma.setts_audit_types.create({
        data: { audit_type: "COMPLIANCE", name: "Compliance Audit" },
      });

      console.log(
        `✅ Created audit types: ${auditType1.name}, ${auditType2.name}, ${auditType3.name}\n`
      );
    } else {
      console.log(`✅ Using existing audit types\n`);
    }

    // 9. Create Question Groups
    console.log("❓ Creating audit question groups...");
    const groupCount = await prisma.setts_audit_question_groups.count();

    if (groupCount === 0) {
      const group1 = await prisma.setts_audit_question_groups.create({
        data: {
          audit_type: "SAFETY",
          group_position: 1,
          group_name: "Personal Protective Equipment",
          group_name_ENG: "Personal Protective Equipment",
        },
      });

      const group2 = await prisma.setts_audit_question_groups.create({
        data: {
          audit_type: "MAINTENANCE",
          group_position: 1,
          group_name: "Equipment Condition",
          group_name_ENG: "Equipment Condition",
        },
      });

      console.log(
        `✅ Created audit question groups: ${group1.group_name}, ${group2.group_name}\n`
      );
    } else {
      console.log(`✅ Using existing question groups\n`);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Data Summary:");
    console.log(`   • Plants: ${plant1 ? 3 : 0}`);
    console.log(`   • Users: 4 (admin, 2 auditors, 1 supervisor)`);
    console.log(`   • Audits: ${audits.length}`);
    console.log(`   • Audit Details: ${details.length}`);
    console.log(`   • Actions: ${actions.length}`);
    console.log(`   • Schedules: 3`);
    console.log(`   • Audit Types: 3`);
    console.log(`   • Question Groups: 2`);
    console.log("\n🔐 Test Credentials (Email / Password):");
    console.log(`   Admin:      admin@auditsystem.com / admin123`);
    console.log(`   Auditor 1:  auditor1@auditsystem.com / auditor123`);
    console.log(`   Auditor 2:  auditor2@auditsystem.com / auditor123`);
    console.log(`   Supervisor: supervisor@auditsystem.com / supervisor123\n`);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
