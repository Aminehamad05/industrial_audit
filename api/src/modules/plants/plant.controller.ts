import { Request, Response } from 'express';
import * as plantService from './plant.service';
import { AppError } from '../../shared/errors/appError';

export async function listPlants(req: Request, res: Response) {
  try {
    const plants = await plantService.getAllPlants();
    res.status(200).json({ plants });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in listPlants:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPlant(req: Request, res: Response) {
  try {
    const plantId = Number(req.params.id);
    const plant = await plantService.getPlantById(plantId);
    res.status(200).json({ plant });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in getPlant:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPlant(req: Request, res: Response) {
  try {
    const plant = await plantService.createPlant(req.body);
    res.status(201).json({ plant });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in createPlant:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePlant(req: Request, res: Response) {
  try {
    const plantId = Number(req.params.id);
    const plant = await plantService.updatePlant(plantId, req.body);
    res.status(200).json({ plant });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in updatePlant:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePlant(req: Request, res: Response) {
  try {
    const plantId = Number(req.params.id);
    await plantService.deletePlant(plantId);
    res.status(200).json({ message: 'Plant deleted successfully' });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in deletePlant:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPlantAudits(req: Request, res: Response) {
  try {
    const plantId = Number(req.params.id);
    const audits = await plantService.getPlantAudits(plantId);
    res.status(200).json({ audits });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in getPlantAudits:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPlantSchedules(req: Request, res: Response) {
  try {
    const plantId = Number(req.params.id);
    const schedules = await plantService.getPlantSchedules(plantId);
    res.status(200).json({ schedules });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in getPlantSchedules:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPlantDashboard(req: Request, res: Response) {
  try {
    const plantId = Number(req.params.id);
    const dashboard = await plantService.getPlantDashboard(plantId);
    res.status(200).json({ dashboard });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error in getPlantDashboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
