import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors/appError';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

async function findPlantOrThrow(plantId: number) {
  const plant = await prisma.plant.findUnique({ where: { idPlant: plantId } });
  if (!plant) {
    throw new AppError(404, `Plant with id ${plantId} not found`);
  }
  return plant;
}

export async function getAllPlants() {
  return prisma.plant.findMany({ orderBy: { idPlant: 'asc' } });
}

export async function getPlantById(plantId: number) {
  return findPlantOrThrow(plantId);
}

export async function createPlant(input: CreatePlantDto) {
  const { designation } = input;

  if (!designation || designation.trim().length === 0) {
    throw new AppError(400, 'Designation cannot be empty');
  }

  return prisma.plant.create({ data: { designationPlant: designation } });
}

export async function updatePlant(plantId: number, input: UpdatePlantDto) {
  await findPlantOrThrow(plantId);

  if (input.designation !== undefined) {
    if (input.designation.trim().length === 0) {
      throw new AppError(400, 'Designation cannot be empty');
    }
  }

  return prisma.plant.update({
    where: { idPlant: plantId },
    data: {
      ...(input.designation !== undefined && { designationPlant: input.designation }),
    },
  });
}

export async function deletePlant(plantId: number): Promise<void> {
  await findPlantOrThrow(plantId);
  await prisma.plant.delete({ where: { idPlant: plantId } });
}

export async function plantExists(plantId: number): Promise<boolean> {
  const plant = await prisma.plant.findUnique({ where: { idPlant: plantId } });
  return plant !== null;
}

export async function getPlantAudits(plantId: number) {
  await findPlantOrThrow(plantId);
  return prisma.audits.findMany({
    where: { plantId },
    orderBy: { startDate: 'desc' },
  });
}

export async function getPlantSchedules(plantId: number) {
  await findPlantOrThrow(plantId);
  return prisma.schedules.findMany({
    where: { plantId },
    orderBy: { auditDate: 'desc' },
  });
}

export async function getPlantDashboard(plantId: number) {
  const plant = await findPlantOrThrow(plantId);

  const [auditsCount, schedulesCount, latestAudits] = await Promise.all([
    prisma.audits.count({ where: { plantId } }),
    prisma.schedules.count({ where: { plantId } }),
    prisma.audits.findMany({
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
