import { Request, Response } from 'express';
import * as schedulesService from './schedules.service';
import * as calendarService from './calendar.service';
import { AppError } from '../../shared/errors/appError';

async function resolveAuditorScope(req: Request): Promise<string[] | undefined> {
  if (req.user?.role === 'AUDITOR') {
    const login = await calendarService.resolveAuditorLoginForUser(req.user.userId);
    return login ? [login] : ['__none__'];
  }
  if (req.user?.role === 'SUPERVISOR') {
    const logins = await calendarService.resolveAuditorLoginsForSupervisor(req.user.userId);
    return logins.length > 0 ? logins : ['__none__'];
  }
  return undefined;
}

export async function listSchedules(req: Request, res: Response) {
  try {
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;
    const auditorLogins = await resolveAuditorScope(req);
    const schedules = await schedulesService.listSchedules({ plantId, auditorLogins });
    res.status(200).json({ schedules });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error in listSchedules:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCalendar(req: Request, res: Response) {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
    const plantId = req.query.plantId ? Number(req.query.plantId) : undefined;

    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const auditorLogins = await resolveAuditorScope(req);
    const calendar = await calendarService.getCalendarEvents({
      year,
      month,
      plantId: Number.isFinite(plantId) ? plantId : undefined,
      auditorLogins,
    });

    res.status(200).json(calendar);
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error in getCalendar:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSchedule(req: Request, res: Response) {
  try {
    const scheduleId = Number(req.params.id);
    const schedule = await schedulesService.getScheduleById(scheduleId);
    res.status(200).json({ schedule });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error in getSchedule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSchedule(req: Request, res: Response) {
  try {
    const schedule = await schedulesService.createSchedule(req.body);
    res.status(201).json({ schedule });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error in createSchedule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSchedule(req: Request, res: Response) {
  try {
    const scheduleId = Number(req.params.id);
    const schedule = await schedulesService.updateSchedule(scheduleId, req.body);
    res.status(200).json({ schedule });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error in updateSchedule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  try {
    const scheduleId = Number(req.params.id);
    await schedulesService.deleteSchedule(scheduleId);
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error in deleteSchedule:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
