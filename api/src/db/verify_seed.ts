import { prisma } from "./prisma";

async function verify() {
  console.log("📊 Verifying seeded data...\n");

  try {
    const userCount = await prisma.aspnet_Users.count();
    const plantCount = await prisma.plant.count();
    const auditCount = await prisma.audits.count();
    const auditDetailCount = await prisma.audit_details.count();
    const actionCount = await prisma.actions.count();
    const scheduleCount = await prisma.schedules.count();
    const statusCount = await prisma.setts_action_status.count();
    const typeCount = await prisma.setts_audit_types.count();
    const groupCount = await prisma.setts_audit_question_groups.count();

    console.log("✅ Database record counts:");
    console.log(`   aspnet_Users: ${userCount}`);
    console.log(`   plant: ${plantCount}`);
    console.log(`   audits: ${auditCount}`);
    console.log(`   audit_details: ${auditDetailCount}`);
    console.log(`   actions: ${actionCount}`);
    console.log(`   schedules: ${scheduleCount}`);
    console.log(`   setts_action_status: ${statusCount}`);
    console.log(`   setts_audit_types: ${typeCount}`);
    console.log(`   setts_audit_question_groups: ${groupCount}`);

    // Get sample users
    const users = await prisma.aspnet_Users.findMany({ take: 4 });
    console.log("\n👥 Sample users:");
    users.forEach((u) => console.log(`   - ${u.UserName} (${u.Email})`));

    // Get sample plants
    const plants = await prisma.plant.findMany({ take: 3 });
    console.log("\n🏭 Sample plants:");
    plants.forEach((p) => console.log(`   - ${p.designationPlant}`));

    console.log("\n✅ Database verification complete!");
  } catch (error) {
    console.error("❌ Verification error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
