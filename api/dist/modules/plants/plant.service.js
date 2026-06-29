"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPlants = getAllPlants;
exports.getPlantById = getPlantById;
exports.createPlant = createPlant;
exports.updatePlant = updatePlant;
exports.deletePlant = deletePlant;
exports.plantExists = plantExists;
exports.getPlantAudits = getPlantAudits;
exports.getPlantSchedules = getPlantSchedules;
exports.getPlantDashboard = getPlantDashboard;
const prisma_1 = require("../../db/prisma");
const appError_1 = require("../../shared/errors/appError");
async function findPlantOrThrow(plantId) {
    const plant = await prisma_1.prisma.plant.findUnique({ where: { idPlant: plantId } });
    if (!plant) {
        throw new appError_1.AppError(404, `Plant with id ${plantId} not found`);
    }
    return plant;
}
async function getAllPlants() {
    return prisma_1.prisma.plant.findMany({ orderBy: { idPlant: 'asc' } });
}
async function getPlantById(plantId) {
    return findPlantOrThrow(plantId);
}
async function createPlant(input) {
    const { designation, family } = input;
    if (!designation || designation.trim().length === 0) {
        throw new appError_1.AppError(400, 'Designation cannot be empty');
    }
    const existing = await prisma_1.prisma.plant.findUnique({ where: { designationPlant: designation } });
    if (existing) {
        throw new appError_1.AppError(400, 'Designation must be unique');
    }
    return prisma_1.prisma.plant.create({ data: { designationPlant: designation } });
}
async function updatePlant(plantId, input) {
    await findPlantOrThrow(plantId);
    if (input.designation !== undefined) {
        if (input.designation.trim().length === 0) {
            throw new appError_1.AppError(400, 'Designation cannot be empty');
        }
        const existing = await prisma_1.prisma.plant.findUnique({ where: { designationPlant: input.designation } });
        if (existing && existing.idPlant !== plantId) {
            throw new appError_1.AppError(400, 'Designation must be unique');
        }
    }
    return prisma_1.prisma.plant.update({
        where: { idPlant: plantId },
        data: {
            ...(input.designation !== undefined && { designationPlant: input.designation }),
        },
    });
}
async function deletePlant(plantId) {
    await findPlantOrThrow(plantId);
    await prisma_1.prisma.plant.delete({ where: { idPlant: plantId } });
}
async function plantExists(plantId) {
    const plant = await prisma_1.prisma.plant.findUnique({ where: { idPlant: plantId } });
    return plant !== null;
}
async function getPlantAudits(plantId) {
    await findPlantOrThrow(plantId);
    return prisma_1.prisma.audits.findMany({
        where: { plantId },
        orderBy: { startDate: 'desc' },
    });
}
async function getPlantSchedules(plantId) {
    await findPlantOrThrow(plantId);
    return prisma_1.prisma.schedules.findMany({
        where: { plantId },
        orderBy: { auditDate: 'desc' },
    });
}
async function getPlantDashboard(plantId) {
    const plant = await findPlantOrThrow(plantId);
    const [auditsCount, schedulesCount, latestAudits] = await Promise.all([
        prisma_1.prisma.audits.count({ where: { plantId } }),
        prisma_1.prisma.schedules.count({ where: { plantId } }),
        prisma_1.prisma.audits.findMany({
            where: { plantId },
            orderBy: { startDate: 'desc' },
            take: 5,
        }),
    ]);
    return {
        plant,
        auditsCount,
        schedulesCount,
        latestAudits,
    };
}
