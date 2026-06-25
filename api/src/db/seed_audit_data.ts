import sql from "mssql";

const DB_CONFIG = {
  server: "localhost", port: 1433, user: "sa", password: "AMINE@hmad05", database: "audit_system",
  options: { encrypt: false, trustServerCertificate: true },
};

async function seed() {
  const pool = await sql.connect(DB_CONFIG);

  const users = await pool.request().query("SELECT id, username, email, full_name AS fullName, role FROM users");
  const plants = await pool.request().query("SELECT id, family, designation FROM plants");

  const auditor1 = users.recordset.find((u: any) => u.role === "Auditor" && u.username === "auditor1");
  const auditor2 = users.recordset.find((u: any) => u.role === "Auditor" && u.username === "auditor2");
  const supervisor = users.recordset.find((u: any) => u.role === "MaintenanceTechnician" && u.username === "supervisor1");
  const fms1 = plants.recordset.find((p: any) => p.designation === "FMS1");
  const fms2 = plants.recordset.find((p: any) => p.designation === "FMS2");
  const ad1 = plants.recordset.find((p: any) => p.designation === "A&D1");

  const now = new Date();

  // --- AUDIT 10: Completed Environment Audit on FMS1 (score: 78.0) ---
  const a1Start = new Date(now.getTime() - 10 * 86400000);
  const a1End = new Date(now.getTime() - 8 * 86400000);

  await pool.request()
    .input("t", sql.NVarChar(100), "ENVIRONMENT")
    .input("tn", sql.NVarChar(200), "Environmental Audit")
    .input("tg", sql.NVarChar(100), "Waste Management Area")
    .input("ta", sql.NVarChar(100), "Waste Zone B")
    .input("au", sql.VarChar(36), auditor1.id)
    .input("al", sql.NVarChar(50), auditor1.email)
    .input("afn", sql.NVarChar(100), auditor1.fullName)
    .input("su", sql.VarChar(36), supervisor?.id || null)
    .input("sn", sql.NVarChar(150), supervisor?.fullName || null)
    .input("sl", sql.NVarChar(100), supervisor?.email || null)
    .input("sd", sql.DateTime2, a1Start)
    .input("ed", sql.DateTime2, a1End)
    .input("sc", sql.Decimal(5, 2), 78.0)
    .input("co", sql.NVarChar(200), "Waste segregation needs improvement.")
    .input("p", sql.Int, fms1.id)
    .query(`INSERT INTO audits (auditType, auditTypeName, auditTarget, auditTargetArea, auditorId, auditorLogin, auditorFullName, supervisorId, supervisorName, supervisorLogin, startDate, endDate, score, comment, plantId) VALUES (@t, @tn, @tg, @ta, @au, @al, @afn, @su, @sn, @sl, @sd, @ed, @sc, @co, @p)`);
  const audit10Id = (await pool.request().query("SELECT MAX(id) AS id FROM audits")).recordset[0].id;
  console.log("Created audit", audit10Id, "(Environmental, completed, 78%)");

  const a1Details = [
    [1, "Gestion des Déchets", "Waste Management", 1, "Les déchets sont-ils correctement triés ?", "Are wastes properly sorted?", 0, 1, 0, 0, "Mixed waste found in recycling bin"],
    [1, "Gestion des Déchets", "Waste Management", 2, "Les conteneurs sont-ils étiquetés ?", "Are containers labeled?", 1, 0, 0, 0, null],
    [1, "Gestion des Déchets", "Waste Management", 3, "Les déchets dangereux sont-ils isolés ?", "Are hazardous wastes isolated?", 1, 0, 0, 0, null],
    [2, "Émissions et Rejets", "Emissions & Discharges", 1, "Les niveaux de COV sont-ils conformes ?", "Are VOC levels compliant?", 1, 0, 0, 0, null],
    [2, "Émissions et Rejets", "Emissions & Discharges", 2, "Les filtres sont-ils maintenus ?", "Are filters maintained?", 0, 0, 1, 0, "Filter #3 due for replacement"],
  ];
  for (const d of a1Details) {
    await pool.request()
      .input("ai", sql.Int, audit10Id).input("gp", sql.Int, d[0]).input("gn", sql.NVarChar(100), d[1]).input("ge", sql.NVarChar(100), d[2])
      .input("qp", sql.Int, d[3]).input("q", sql.NVarChar(800), d[4]).input("qe", sql.NVarChar(800), d[5])
      .input("ok", sql.Bit, d[6]).input("nok", sql.Bit, d[7]).input("nc", sql.Bit, d[8]).input("na", sql.Bit, d[9])
      .input("cm", sql.NVarChar(200), d[10]).input("pl", sql.Int, fms1.id)
      .query(`INSERT INTO audit_details (auditId, groupPosition, groupName, groupNameEng, questionPosition, question, questionEng, answerOk, answerNok, answerNc, answerNa, comment, plantId) VALUES (@ai, @gp, @gn, @ge, @qp, @q, @qe, @ok, @nok, @nc, @na, @cm, @pl)`);
  }
  console.log("  -> 5 questions seeded");

  // --- AUDIT 11: Completed Quality Audit on A&D1 (score: 55.0) ---
  const a2Start = new Date(now.getTime() - 6 * 86400000);
  const a2End = new Date(now.getTime() - 4 * 86400000);

  await pool.request()
    .input("t", sql.NVarChar(100), "QUALITY").input("tn", sql.NVarChar(200), "Quality Control")
    .input("tg", sql.NVarChar(100), "Assembly Line C").input("ta", sql.NVarChar(100), "Line C")
    .input("au", sql.VarChar(36), auditor2.id).input("al", sql.NVarChar(50), auditor2.email).input("afn", sql.NVarChar(100), auditor2.fullName)
    .input("sd", sql.DateTime2, a2Start).input("ed", sql.DateTime2, a2End)
    .input("sc", sql.Decimal(5, 2), 55.0)
    .input("co", sql.NVarChar(200), "Multiple non-conformities detected. Immediate corrective action required.")
    .input("p", sql.Int, ad1.id)
    .query(`INSERT INTO audits (auditType, auditTypeName, auditTarget, auditTargetArea, auditorId, auditorLogin, auditorFullName, startDate, endDate, score, comment, plantId) VALUES (@t, @tn, @tg, @ta, @au, @al, @afn, @sd, @ed, @sc, @co, @p)`);
  const audit11Id = (await pool.request().query("SELECT MAX(id) AS id FROM audits")).recordset[0].id;
  console.log("Created audit", audit11Id, "(Quality, completed, 55%)");

  const a2Details = [
    [1, "Contrôle Dimensionnel", "Dimensional Control", 1, "Les tolérances sont-elles respectées ?", "Are tolerances respected?", 0, 1, 0, 0, "Part #A452: 0.3mm over tolerance"],
    [1, "Contrôle Dimensionnel", "Dimensional Control", 2, "Les gabarits sont-ils calibrés ?", "Are gauges calibrated?", 1, 0, 0, 0, null],
    [2, "Traçabilité", "Traceability", 1, "Les lots sont-ils identifiés ?", "Are batches identified?", 1, 0, 0, 0, null],
    [2, "Traçabilité", "Traceability", 2, "Les numéros de série sont-ils enregistrés ?", "Are serial numbers recorded?", 0, 0, 1, 0, "Batch #4523: missing serials"],
    [2, "Traçabilité", "Traceability", 3, "Les fiches de suivi sont-elles remplies ?", "Are tracking forms completed?", 0, 1, 0, 0, "Forms not filled for last 3 batches"],
    [3, "Tests Fonctionnels", "Functional Tests", 1, "Les tests de fuite sont-ils passés ?", "Are leak tests passed?", 1, 0, 0, 0, null],
    [3, "Tests Fonctionnels", "Functional Tests", 2, "Les pressions de test sont-elles conformes ?", "Are test pressures compliant?", 0, 1, 0, 0, "Pressure dropped 5% during test #4"],
  ];
  for (const d of a2Details) {
    await pool.request()
      .input("ai", sql.Int, audit11Id).input("gp", sql.Int, d[0]).input("gn", sql.NVarChar(100), d[1]).input("ge", sql.NVarChar(100), d[2])
      .input("qp", sql.Int, d[3]).input("q", sql.NVarChar(800), d[4]).input("qe", sql.NVarChar(800), d[5])
      .input("ok", sql.Bit, d[6]).input("nok", sql.Bit, d[7]).input("nc", sql.Bit, d[8]).input("na", sql.Bit, d[9])
      .input("cm", sql.NVarChar(200), d[10]).input("pl", sql.Int, ad1.id)
      .query(`INSERT INTO audit_details (auditId, groupPosition, groupName, groupNameEng, questionPosition, question, questionEng, answerOk, answerNok, answerNc, answerNa, comment, plantId) VALUES (@ai, @gp, @gn, @ge, @qp, @q, @qe, @ok, @nok, @nc, @na, @cm, @pl)`);
  }
  console.log("  -> 7 questions seeded");

  // --- AUDIT 12: In-Progress 5S Audit on FMS2 ---
  const a3Start = new Date(now.getTime() - 1 * 86400000);

  await pool.request()
    .input("t", sql.NVarChar(100), "5S").input("tn", sql.NVarChar(200), "5S Audit")
    .input("tg", sql.NVarChar(100), "Workshop Floor D").input("ta", sql.NVarChar(100), "Workshop D")
    .input("au", sql.VarChar(36), auditor1.id).input("al", sql.NVarChar(50), auditor1.email).input("afn", sql.NVarChar(100), auditor1.fullName)
    .input("sd", sql.DateTime2, a3Start).input("ed", sql.DateTime2, null)
    .input("sc", sql.Decimal(5, 2), null).input("co", sql.NVarChar(200), null)
    .input("p", sql.Int, fms2.id)
    .query(`INSERT INTO audits (auditType, auditTypeName, auditTarget, auditTargetArea, auditorId, auditorLogin, auditorFullName, startDate, endDate, score, comment, plantId) VALUES (@t, @tn, @tg, @ta, @au, @al, @afn, @sd, @ed, @sc, @co, @p)`);
  const audit12Id = (await pool.request().query("SELECT MAX(id) AS id FROM audits")).recordset[0].id;
  console.log("Created audit", audit12Id, "(5S, in progress)");

  const a3Details = [
    [1, "Tri (Seiri)", "Sort (Seiri)", 1, "Les outils inutilisés ont-ils été retirés ?", "Have unused tools been removed?", 1, 0, 0, 0, null],
    [1, "Tri (Seiri)", "Sort (Seiri)", 2, "Les rebuts sont-ils évacués ?", "Are scrap items removed?", 0, 1, 0, 0, "Scrap bin full at station 2"],
    [2, "Range (Seiton)", "Set in Order (Seiton)", 1, "Les outils ont-ils un emplacement défini ?", "Do tools have assigned places?", 1, 0, 0, 0, null],
    [2, "Range (Seiton)", "Set in Order (Seiton)", 2, "Les allées sont-elles balisées ?", "Are walkways marked?", 0, 0, 1, 0, "Markings faded near exit"],
    [2, "Range (Seiton)", "Set in Order (Seiton)", 3, "Les racks sont-ils identifiés ?", "Are racks labeled?", 0, 0, 0, 0, null],
  ];
  for (const d of a3Details) {
    await pool.request()
      .input("ai", sql.Int, audit12Id).input("gp", sql.Int, d[0]).input("gn", sql.NVarChar(100), d[1]).input("ge", sql.NVarChar(100), d[2])
      .input("qp", sql.Int, d[3]).input("q", sql.NVarChar(800), d[4]).input("qe", sql.NVarChar(800), d[5])
      .input("ok", sql.Bit, d[6]).input("nok", sql.Bit, d[7]).input("nc", sql.Bit, d[8]).input("na", sql.Bit, d[9])
      .input("cm", sql.NVarChar(200), d[10]).input("pl", sql.Int, fms2.id)
      .query(`INSERT INTO audit_details (auditId, groupPosition, groupName, groupNameEng, questionPosition, question, questionEng, answerOk, answerNok, answerNc, answerNa, comment, plantId) VALUES (@ai, @gp, @gn, @ge, @qp, @q, @qe, @ok, @nok, @nc, @na, @cm, @pl)`);
  }
  console.log("  -> 5 questions seeded");

  // --- Add more details to existing Audit 2 (Quality, no answers yet for most) ---
  const extraDetails = [
    { auditId: 2, gp: 2, gn: "Documentation", ge: "Documentation", qp: 1, q: "Les fiches d'instruction sont-elles à jour ?", qe: "Are instruction sheets up to date?", ok: 1, nok: 0, nc: 0, na: 0, cm: null, pl: ad1.id },
    { auditId: 2, gp: 2, gn: "Documentation", ge: "Documentation", qp: 2, q: "Les enregistrements sont-ils signés ?", qe: "Are records signed?", ok: 0, nok: 0, nc: 0, na: 0, cm: null, pl: ad1.id },
  ];
  for (const d of extraDetails) {
    await pool.request()
      .input("ai", sql.Int, d.auditId).input("gp", sql.Int, d.gp).input("gn", sql.NVarChar(100), d.gn).input("ge", sql.NVarChar(100), d.ge)
      .input("qp", sql.Int, d.qp).input("q", sql.NVarChar(800), d.q).input("qe", sql.NVarChar(800), d.qe)
      .input("ok", sql.Bit, d.ok).input("nok", sql.Bit, d.nok).input("nc", sql.Bit, d.nc).input("na", sql.Bit, d.na)
      .input("cm", sql.NVarChar(200), d.cm).input("pl", sql.Int, d.pl)
      .query(`INSERT INTO audit_details (auditId, groupPosition, groupName, groupNameEng, questionPosition, question, questionEng, answerOk, answerNok, answerNc, answerNa, comment, plantId) VALUES (@ai, @gp, @gn, @ge, @qp, @q, @qe, @ok, @nok, @nc, @na, @cm, @pl)`);
  }
  console.log("  -> Added 2 more questions to Audit 2");

  // Also add details to Audit 3 (upcoming, no answers)
  const audit3Details = [
    [1, "Condition des Machines", "Machine Condition", 1, "Les machines sont-elles en bon état ?", "Are machines in good condition?", 0, 0, 0, 0, null],
    [1, "Condition des Machines", "Machine Condition", 2, "Les arrêts d'urgence sont-ils fonctionnels ?", "Are emergency stops functional?", 0, 0, 0, 0, null],
    [1, "Condition des Machines", "Machine Condition", 3, "Les protecteurs sont-ils en place ?", "Are guards in place?", 0, 0, 0, 0, null],
    [2, "Maintenance Préventive", "Preventive Maintenance", 1, "Le plan de maintenance est-il respecté ?", "Is maintenance schedule followed?", 0, 0, 0, 0, null],
    [2, "Maintenance Préventive", "Preventive Maintenance", 2, "Les pièces d'usure sont-elles changées ?", "Are wear parts replaced?", 0, 0, 0, 0, null],
  ];
  for (const d of audit3Details) {
    await pool.request()
      .input("ai", sql.Int, 3).input("gp", sql.Int, d[0]).input("gn", sql.NVarChar(100), d[1]).input("ge", sql.NVarChar(100), d[2])
      .input("qp", sql.Int, d[3]).input("q", sql.NVarChar(800), d[4]).input("qe", sql.NVarChar(800), d[5])
      .input("ok", sql.Bit, d[6]).input("nok", sql.Bit, d[7]).input("nc", sql.Bit, d[8]).input("na", sql.Bit, d[9])
      .input("cm", sql.NVarChar(200), d[10]).input("pl", sql.Int, fms2.id)
      .query(`INSERT INTO audit_details (auditId, groupPosition, groupName, groupNameEng, questionPosition, question, questionEng, answerOk, answerNok, answerNc, answerNa, comment, plantId) VALUES (@ai, @gp, @gn, @ge, @qp, @q, @qe, @ok, @nok, @nc, @na, @cm, @pl)`);
  }
  console.log("  -> Added 5 questions to Audit 3");

  console.log("\n--- Seed complete ---");
  console.log("Now you have:");
  console.log("  - Audit 1: Safety (completed, 87.5% on FMS1) - 2 details");
  console.log("  - Audit 2: Quality (in progress on A&D1) - 3 details");
  console.log("  - Audit 3: Maintenance (upcoming on FMS2) - 5 details");
  console.log(`  - Audit ${audit10Id}: Environmental (completed, 78% on FMS1) - 5 details`);
  console.log(`  - Audit ${audit11Id}: Quality (completed, 55% on A&D1) - 7 details`);
  console.log(`  - Audit ${audit12Id}: 5S (in progress on FMS2) - 5 details`);

  await pool.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
