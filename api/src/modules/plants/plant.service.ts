import { AppDataSource } from '../../db/data-source';
import { Plant } from './enitites/plant.entities';
import { Audit } from '../audits/entitites/Audit';
import { Schedule } from '../audits/entitites/Schedule';
import { User } from '../users/user.entity';
import { AppError } from '../../shared/errors/appError';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

const plantRepo = AppDataSource.getRepository(Plant);

async function findPlantOrThrow(plantId: number): Promise<Plant> {
  const plant = await plantRepo.findOne({ where: { id: plantId } });
  if (!plant) {
    throw new AppError(404, `Plant with id ${plantId} not found`);
  }
  return plant;
}

export async function getAllPlants(): Promise<Plant[]> {
  return plantRepo.find({ order: { id: 'ASC' } });
}

export async function getPlantById(plantId: number): Promise<Plant> {
  return findPlantOrThrow(plantId);
}

export async function createPlant(input: CreatePlantDto): Promise<Plant> {
  const { designation, family } = input;

  if (!designation || designation.trim().length === 0) {
    throw new AppError(400, 'Designation cannot be empty');
  }

  if (family !== 'FMS' && family !== 'A&D') {
    throw new AppError(400, 'Family must be FMS or A&D');
  }

  const existing = await plantRepo.findOne({ where: { designation } });
  if (existing) {
    throw new AppError(400, 'Designation must be unique');
  }

  const plant = plantRepo.create({ designation, family });
  return plantRepo.save(plant);
}

export async function updatePlant(plantId: number, input: UpdatePlantDto): Promise<Plant> {
  const plant = await findPlantOrThrow(plantId);

  if (input.designation !== undefined) {
    if (input.designation.trim().length === 0) {
      throw new AppError(400, 'Designation cannot be empty');
    }

    const existing = await plantRepo.findOne({ where: { designation: input.designation } });
    if (existing && existing.id !== plantId) {
      throw new AppError(400, 'Designation must be unique');
    }

    plant.designation = input.designation;
  }

  if (input.family !== undefined) {
    if (input.family !== 'FMS' && input.family !== 'A&D') {
      throw new AppError(400, 'Family must be FMS or A&D');
    }

    plant.family = input.family;
  }

  return plantRepo.save(plant);
}

export async function deletePlant(plantId: number): Promise<void> {
  const plant = await findPlantOrThrow(plantId);
  await plantRepo.remove(plant);
}

export async function plantExists(plantId: number): Promise<boolean> {
  const count = await plantRepo.count({ where: { id: plantId } });
  return count > 0;
}

export async function getPlantAudits(plantId: number): Promise<Audit[]> {
  await findPlantOrThrow(plantId);
  const auditRepo = AppDataSource.getRepository(Audit);
  return auditRepo.find({
    where: { plantId },
    order: { startDate: 'DESC' },
  });
}

export async function getPlantUsers(plantId: number): Promise<User[]> {
  await findPlantOrThrow(plantId);
  const userRepo = AppDataSource.getRepository(User);
  return userRepo.find({
    where: { plant: { id: plantId } },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      accountStatus: true,
    },
  });
}

export async function getPlantSchedules(plantId: number): Promise<Schedule[]> {
  await findPlantOrThrow(plantId);
  const scheduleRepo = AppDataSource.getRepository(Schedule);
  return scheduleRepo.find({
    where: { plantId },
    order: { auditDate: 'DESC' },
  });
}

export async function getPlantDashboard(plantId: number) {
  const plant = await findPlantOrThrow(plantId);

  const auditRepo = AppDataSource.getRepository(Audit);
  const userRepo = AppDataSource.getRepository(User);
  const scheduleRepo = AppDataSource.getRepository(Schedule);

  const [auditsCount, usersCount, schedulesCount, latestAudits] = await Promise.all([
    auditRepo.count({ where: { plantId } }),
    userRepo.count({ where: { plant: { id: plantId } } }),
    scheduleRepo.count({ where: { plantId } }),
    auditRepo.find({
      where: { plantId },
      order: { startDate: 'DESC' },
      take: 5,
    }),
  ]);

  return {
    plant,
    auditsCount,
    usersCount,
    schedulesCount,
    latestAudits,
  };
}
