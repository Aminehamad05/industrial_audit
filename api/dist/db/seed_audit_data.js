"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./prisma");
async function seed() {
    const users = await prisma_1.prisma.users.findMany();
    const plants = await prisma_1.prisma.plants.findMany();
    const auditor1 = users.find((u) => u.role === "Auditor" && u.username === "auditor1");
    const auditor2 = users.find((u) => u.role === "Auditor" && u.username === "auditor2");
    const supervisor = users.find((u) => u.role === "MaintenanceTechnician" && u.username === "supervisor1");
    const fms1 = plants.find((p) => p.designation === "FMS1");
    const fms2 = plants.find((p) => p.designation === "FMS2");
    const ad1 = plants.find((p) => p.designation === "A&D1");
    if (!auditor1 || !auditor2 || !fms1 || !fms2 || !ad1) {
        console.error("Missing required seed data. Run the main seed first.");
        process.exit(1);
    }
    const now = new Date();
    // --- AUDIT 10: Completed Environment Audit on FMS1 (score: 78.0) ---
    const a1Start = new Date(now.getTime() - 10 * 86400000);
    const a1End = new Date(now.getTime() - 8 * 86400000);
    const audit10 = await prisma_1.prisma.audits.create({
        data: {
            auditType: "ENVIRONMENT",
            auditTypeName: "Environmental Audit",
            auditTarget: "Waste Management Area",
            auditTargetArea: "Waste Zone B",
            auditorId: auditor1.id,
            auditorLogin: auditor1.email,
            auditorFullName: auditor1.full_name,
            supervisorId: supervisor?.id ?? null,
            supervisorName: supervisor?.full_name ?? null,
            supervisorLogin: supervisor?.email ?? null,
            startDate: a1Start,
            endDate: a1End,
            score: 78.0,
            comment: "Waste segregation needs improvement.",
            plantId: fms1.id,
        },
    });
    console.log("Created audit", audit10.id, "(Environmental, completed, 78%)");
    const a1Details = [
        [1, "Gestion des Déchets", "Waste Management", 1, "Les déchets sont-ils correctement triés ?", "Are wastes properly sorted?", false, true, false, false, "Mixed waste found in recycling bin"],
        [1, "Gestion des Déchets", "Waste Management", 2, "Les conteneurs sont-ils étiquetés ?", "Are containers labeled?", true, false, false, false, null],
        [1, "Gestion des Déchets", "Waste Management", 3, "Les déchets dangereux sont-ils isolés ?", "Are hazardous wastes isolated?", true, false, false, false, null],
        [2, "Émissions et Rejets", "Emissions & Discharges", 1, "Les niveaux de COV sont-ils conformes ?", "Are VOC levels compliant?", true, false, false, false, null],
        [2, "Émissions et Rejets", "Emissions & Discharges", 2, "Les filtres sont-ils maintenus ?", "Are filters maintained?", false, false, true, false, "Filter #3 due for replacement"],
    ];
    for (const d of a1Details) {
        await prisma_1.prisma.audit_details.create({
            data: {
                auditId: audit10.id,
                groupPosition: d[0],
                groupName: d[1],
                groupNameEng: d[2],
                questionPosition: d[3],
                question: d[4],
                questionEng: d[5],
                answerOk: d[6],
                answerNok: d[7],
                answerNc: d[8],
                answerNa: d[9],
                comment: d[10],
                plantId: fms1.id,
            },
        });
    }
    console.log("  -> 5 questions seeded");
    // --- AUDIT 11: Completed Quality Audit on A&D1 (score: 55.0) ---
    const a2Start = new Date(now.getTime() - 6 * 86400000);
    const a2End = new Date(now.getTime() - 4 * 86400000);
    const audit11 = await prisma_1.prisma.audits.create({
        data: {
            auditType: "QUALITY",
            auditTypeName: "Quality Control",
            auditTarget: "Assembly Line C",
            auditTargetArea: "Line C",
            auditorId: auditor2.id,
            auditorLogin: auditor2.email,
            auditorFullName: auditor2.full_name,
            startDate: a2Start,
            endDate: a2End,
            score: 55.0,
            comment: "Multiple non-conformities detected. Immediate corrective action required.",
            plantId: ad1.id,
        },
    });
    console.log("Created audit", audit11.id, "(Quality, completed, 55%)");
    const a2Details = [
        [1, "Contrôle Dimensionnel", "Dimensional Control", 1, "Les tolérances sont-elles respectées ?", "Are tolerances respected?", false, true, false, false, "Part #A452: 0.3mm over tolerance"],
        [1, "Contrôle Dimensionnel", "Dimensional Control", 2, "Les gabarits sont-ils calibrés ?", "Are gauges calibrated?", true, false, false, false, null],
        [2, "Traçabilité", "Traceability", 1, "Les lots sont-ils identifiés ?", "Are batches identified?", true, false, false, false, null],
        [2, "Traçabilité", "Traceability", 2, "Les numéros de série sont-ils enregistrés ?", "Are serial numbers recorded?", false, false, true, false, "Batch #4523: missing serials"],
        [2, "Traçabilité", "Traceability", 3, "Les fiches de suivi sont-elles remplies ?", "Are tracking forms completed?", false, true, false, false, "Forms not filled for last 3 batches"],
        [3, "Tests Fonctionnels", "Functional Tests", 1, "Les tests de fuite sont-ils passés ?", "Are leak tests passed?", true, false, false, false, null],
        [3, "Tests Fonctionnels", "Functional Tests", 2, "Les pressions de test sont-elles conformes ?", "Are test pressures compliant?", false, true, false, false, "Pressure dropped 5% during test #4"],
    ];
    for (const d of a2Details) {
        await prisma_1.prisma.audit_details.create({
            data: {
                auditId: audit11.id,
                groupPosition: d[0],
                groupName: d[1],
                groupNameEng: d[2],
                questionPosition: d[3],
                question: d[4],
                questionEng: d[5],
                answerOk: d[6],
                answerNok: d[7],
                answerNc: d[8],
                answerNa: d[9],
                comment: d[10],
                plantId: ad1.id,
            },
        });
    }
    console.log("  -> 7 questions seeded");
    // --- AUDIT 12: In-Progress 5S Audit on FMS2 ---
    const a3Start = new Date(now.getTime() - 1 * 86400000);
    const audit12 = await prisma_1.prisma.audits.create({
        data: {
            auditType: "5S",
            auditTypeName: "5S Audit",
            auditTarget: "Workshop Floor D",
            auditTargetArea: "Workshop D",
            auditorId: auditor1.id,
            auditorLogin: auditor1.email,
            auditorFullName: auditor1.full_name,
            startDate: a3Start,
            plantId: fms2.id,
        },
    });
    console.log("Created audit", audit12.id, "(5S, in progress)");
    const a3Details = [
        [1, "Tri (Seiri)", "Sort (Seiri)", 1, "Les outils inutilisés ont-ils été retirés ?", "Have unused tools been removed?", true, false, false, false, null],
        [1, "Tri (Seiri)", "Sort (Seiri)", 2, "Les rebuts sont-ils évacués ?", "Are scrap items removed?", false, true, false, false, "Scrap bin full at station 2"],
        [2, "Range (Seiton)", "Set in Order (Seiton)", 1, "Les outils ont-ils un emplacement défini ?", "Do tools have assigned places?", true, false, false, false, null],
        [2, "Range (Seiton)", "Set in Order (Seiton)", 2, "Les allées sont-elles balisées ?", "Are walkways marked?", false, false, true, false, "Markings faded near exit"],
        [2, "Range (Seiton)", "Set in Order (Seiton)", 3, "Les racks sont-ils identifiés ?", "Are racks labeled?", false, false, false, false, null],
    ];
    for (const d of a3Details) {
        await prisma_1.prisma.audit_details.create({
            data: {
                auditId: audit12.id,
                groupPosition: d[0],
                groupName: d[1],
                groupNameEng: d[2],
                questionPosition: d[3],
                question: d[4],
                questionEng: d[5],
                answerOk: d[6],
                answerNok: d[7],
                answerNc: d[8],
                answerNa: d[9],
                comment: d[10],
                plantId: fms2.id,
            },
        });
    }
    console.log("  -> 5 questions seeded");
    // --- Add more details to existing Audit 2 (Quality, no answers yet for most) ---
    const audit2 = await prisma_1.prisma.audits.findUnique({ where: { id: 2 } });
    if (audit2) {
        const extraDetails = [
            { gp: 2, gn: "Documentation", ge: "Documentation", qp: 1, q: "Les fiches d'instruction sont-elles à jour ?", qe: "Are instruction sheets up to date?", ok: true, nok: false, nc: false, na: false, cm: null },
            { gp: 2, gn: "Documentation", ge: "Documentation", qp: 2, q: "Les enregistrements sont-ils signés ?", qe: "Are records signed?", ok: false, nok: false, nc: false, na: false, cm: null },
        ];
        for (const d of extraDetails) {
            await prisma_1.prisma.audit_details.create({
                data: {
                    auditId: audit2.id,
                    groupPosition: d.gp,
                    groupName: d.gn,
                    groupNameEng: d.ge,
                    questionPosition: d.qp,
                    question: d.q,
                    questionEng: d.qe,
                    answerOk: d.ok,
                    answerNok: d.nok,
                    answerNc: d.nc,
                    answerNa: d.na,
                    comment: d.cm,
                    plantId: audit2.plantId,
                },
            });
        }
        console.log("  -> Added 2 more questions to Audit 2");
    }
    else {
        console.log("  -> Audit 2 not found, skipping extra details");
    }
    // Also add details to Audit 3 (upcoming, no answers)
    const audit3 = await prisma_1.prisma.audits.findUnique({ where: { id: 3 } });
    if (audit3) {
        const audit3Details = [
            [1, "Condition des Machines", "Machine Condition", 1, "Les machines sont-elles en bon état ?", "Are machines in good condition?", false, false, false, false, null],
            [1, "Condition des Machines", "Machine Condition", 2, "Les arrêts d'urgence sont-ils fonctionnels ?", "Are emergency stops functional?", false, false, false, false, null],
            [1, "Condition des Machines", "Machine Condition", 3, "Les protecteurs sont-ils en place ?", "Are guards in place?", false, false, false, false, null],
            [2, "Maintenance Préventive", "Preventive Maintenance", 1, "Le plan de maintenance est-il respecté ?", "Is maintenance schedule followed?", false, false, false, false, null],
            [2, "Maintenance Préventive", "Preventive Maintenance", 2, "Les pièces d'usure sont-elles changées ?", "Are wear parts replaced?", false, false, false, false, null],
        ];
        for (const d of audit3Details) {
            await prisma_1.prisma.audit_details.create({
                data: {
                    auditId: audit3.id,
                    groupPosition: d[0],
                    groupName: d[1],
                    groupNameEng: d[2],
                    questionPosition: d[3],
                    question: d[4],
                    questionEng: d[5],
                    answerOk: d[6],
                    answerNok: d[7],
                    answerNc: d[8],
                    answerNa: d[9],
                    comment: d[10],
                    plantId: audit3.plantId,
                },
            });
        }
        console.log("  -> Added 5 questions to Audit 3");
    }
    else {
        console.log("  -> Audit 3 not found, skipping details");
    }
    console.log("\n--- Seed complete ---");
    console.log("Now you have:");
    console.log("  - Audit 1: Safety (completed, 87.5% on FMS1) - 2 details");
    console.log("  - Audit 2: Quality (in progress on A&D1) - 3 details");
    console.log("  - Audit 3: Maintenance (upcoming on FMS2) - 5 details");
    console.log(`  - Audit ${audit10.id}: Environmental (completed, 78% on FMS1) - 5 details`);
    console.log(`  - Audit ${audit11.id}: Quality (completed, 55% on A&D1) - 7 details`);
    console.log(`  - Audit ${audit12.id}: 5S (in progress on FMS2) - 5 details`);
}
seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
