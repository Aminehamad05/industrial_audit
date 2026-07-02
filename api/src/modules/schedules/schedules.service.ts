import { prisma } from '../../db/prisma';
import { AppError } from '../../shared/errors/appError';

export async function listSchedules(filters?: { plantId?: number; auditorLogins?: string[] }) {
  const where: any = {};
  if (filters?.plantId) {
    where.plantId = filters.plantId;
  }
  if (filters?.auditorLogins?.length) {
    where.auditor_login = { in: filters.auditorLogins };
  }
  return prisma.schedules.findMany({
    where,
    include: {
      plant: true,
    },
    orderBy: { id: 'desc' },
  });
}

export async function getScheduleById(id: number) {
  const schedule = await prisma.schedules.findUnique({
    where: { id },
    include: {
      plant: true,
    },
  });
  if (!schedule) {
    throw new AppError(404, `Schedule with ID ${id} not found`);
  }
  return schedule;
}

export async function createSchedule(data: {
  scheduleName: string;
  auditType: string;
  auditTarget?: string;
  auditDate?: string | Date | null;
  plantId?: number;
  auditor_login?: string;
  section?: string;
  status?: number;
}) {
  if (!data.scheduleName || data.scheduleName.trim() === '') {
    throw new AppError(400, 'Schedule name is required');
  }
  if (!data.auditType || data.auditType.trim() === '') {
    throw new AppError(400, 'Audit type is required');
  }

  const dateVal = data.auditDate ? new Date(data.auditDate) : null;
  let auditYear: number | null = null;
  let auditMonth: number | null = null;

  if (dateVal && !isNaN(dateVal.getTime())) {
    auditYear = dateVal.getFullYear();
    auditMonth = dateVal.getMonth() + 1; // 1-indexed
  }

  return prisma.schedules.create({
    data: {
      scheduleName: data.scheduleName,
      auditType: data.auditType,
      auditTarget: data.auditTarget ?? null,
      auditDate: dateVal,
      auditYear,
      auditMonth,
      plantId: data.plantId ?? null,
      auditor_login: data.auditor_login ?? null,
      section: data.section ?? null,
      status: data.status ?? null,
    },
  });
}

export async function updateSchedule(
  id: number,
  data: {
    scheduleName?: string;
    auditType?: string;
    auditTarget?: string;
    auditDate?: string | Date | null;
    plantId?: number;
    auditor_login?: string;
    section?: string;
    status?: number;
  }
) {
  const existing = await prisma.schedules.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, `Schedule with ID ${id} not found`);
  }

  if (data.scheduleName !== undefined && data.scheduleName.trim() === '') {
    throw new AppError(400, 'Schedule name cannot be empty');
  }
  if (data.auditType !== undefined && data.auditType.trim() === '') {
    throw new AppError(400, 'Audit type cannot be empty');
  }

  const updateData: any = {};
  if (data.scheduleName !== undefined) updateData.scheduleName = data.scheduleName;
  if (data.auditType !== undefined) updateData.auditType = data.auditType;
  if (data.auditTarget !== undefined) updateData.auditTarget = data.auditTarget;
  if (data.plantId !== undefined) updateData.plantId = data.plantId;
  if (data.auditor_login !== undefined) updateData.auditor_login = data.auditor_login;
  if (data.section !== undefined) updateData.section = data.section;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.auditDate !== undefined) {
    const dateVal = data.auditDate ? new Date(data.auditDate) : null;
    updateData.auditDate = dateVal;
    if (dateVal && !isNaN(dateVal.getTime())) {
      updateData.auditYear = dateVal.getFullYear();
      updateData.auditMonth = dateVal.getMonth() + 1;
    } else {
      updateData.auditYear = null;
      updateData.auditMonth = null;
    }
  }

  return prisma.schedules.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteSchedule(id: number) {
  const existing = await prisma.schedules.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, `Schedule with ID ${id} not found`);
  }
  return prisma.schedules.delete({ where: { id } });
}
