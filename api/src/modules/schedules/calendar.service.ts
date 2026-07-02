import { prisma } from '../../db/prisma';
import { deriveAuditStatus } from '../audits/audits.service';

export interface CalendarQuery {
  year: number;
  month: number;
  plantId?: number;
  auditorLogins?: string[];
}

function sameCalendarDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function dateKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthRange(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  return { from, to };
}

/**
 * Schedule ↔ audit matching:
 * 1. Primary: audits.scheduleId === schedules.id (explicit FK id_Schedule)
 * 2. Fallback (when scheduleId is null): same plantId + same auditor login
 *    (case-insensitive) + same calendar day (schedule.auditDate vs audit.startDate)
 */
function findMatchingAudit<
  T extends {
    id: number;
    scheduleId: number | null;
    plantId: number | null;
    auditorLogin: string | null;
    startDate: Date | null;
    endDate: Date | null;
    eliminated: boolean;
  },
>(
  schedule: {
    id: number;
    plantId: number | null;
    auditor_login: string | null;
    auditDate: Date | null;
  },
  audits: T[]
): { audit: T | null; matchType: 'scheduleId' | 'heuristic' | null } {
  const byFk = audits.find((a) => a.scheduleId === schedule.id);
  if (byFk) return { audit: byFk, matchType: 'scheduleId' as const };

  const byHeuristic = audits.find(
    (a) =>
      a.scheduleId == null &&
      a.plantId === schedule.plantId &&
      a.auditorLogin?.toLowerCase() === schedule.auditor_login?.toLowerCase() &&
      sameCalendarDay(a.startDate, schedule.auditDate)
  );
  if (byHeuristic) return { audit: byHeuristic, matchType: 'heuristic' as const };

  return { audit: null, matchType: null };
}

function scheduleEventState(
  audit: {
    startDate: Date | null;
    endDate: Date | null;
    eliminated: boolean;
    _count?: { audit_details: number };
  } | null,
  detailsCount = 0
): 'planned' | 'in_progress' | 'done' | 'failed_ko' {
  if (!audit) return 'planned';
  if (audit.eliminated) return 'failed_ko';
  if (audit.endDate) return 'done';
  const status = deriveAuditStatus({
    startDate: audit.startDate,
    endDate: audit.endDate,
    eliminated: audit.eliminated,
    detailsCount,
  });
  if (status === 'InProgress') return 'in_progress';
  if (status === 'Missed') return 'planned';
  return 'in_progress';
}

export async function getCalendarEvents(query: CalendarQuery) {
  const { from, to } = monthRange(query.year, query.month);

  const scheduleWhere: Record<string, unknown> = {
    auditDate: { gte: from, lte: to },
  };
  if (query.plantId) scheduleWhere.plantId = query.plantId;
  if (query.auditorLogins?.length) {
    scheduleWhere.auditor_login = { in: query.auditorLogins };
  }

  const auditWhere: Record<string, unknown> = {
    startDate: { gte: from, lte: to },
  };
  if (query.plantId) auditWhere.plantId = query.plantId;
  if (query.auditorLogins?.length) {
    auditWhere.auditorLogin = { in: query.auditorLogins };
  }

  const [schedules, audits] = await Promise.all([
    prisma.schedules.findMany({
      where: scheduleWhere as any,
      include: { plant: { select: { designationPlant: true } } },
      orderBy: { auditDate: 'asc' },
    }),
    prisma.audits.findMany({
      where: auditWhere as any,
      select: {
        id: true,
        scheduleId: true,
        plantId: true,
        auditorLogin: true,
        auditorFullName: true,
        startDate: true,
        endDate: true,
        eliminated: true,
        auditType: true,
        auditTypeName: true,
        auditTarget: true,
        score: true,
        _count: { select: { audit_details: true } },
        plant: { select: { designationPlant: true } },
      },
      orderBy: { startDate: 'asc' },
    }),
  ]);

  const matchedAuditIds = new Set<number>();
  const events: Array<{
    id: string;
    date: string;
    kind: 'schedule' | 'audit';
    state: 'planned' | 'in_progress' | 'done' | 'failed_ko';
    scheduleId: number | null;
    auditId: number | null;
    matchType: 'scheduleId' | 'heuristic' | null;
    title: string;
    auditType: string | null;
    auditTarget: string | null;
    auditorLogin: string | null;
    auditorFullName: string | null;
    plantId: number | null;
    plantName: string | null;
    score: number | null;
  }> = [];

  for (const schedule of schedules) {
    if (!schedule.auditDate) continue;
    const { audit, matchType } = findMatchingAudit(schedule, audits);
    if (audit) matchedAuditIds.add(audit.id);

    const detailsCount =
      audit && '_count' in audit && audit._count
        ? (audit._count as { audit_details: number }).audit_details
        : 0;
    const state = scheduleEventState(audit, detailsCount);
    events.push({
      id: `schedule-${schedule.id}`,
      date: dateKey(schedule.auditDate),
      kind: 'schedule',
      state,
      scheduleId: schedule.id,
      auditId: audit?.id ?? null,
      matchType,
      title: schedule.scheduleName,
      auditType: schedule.auditType,
      auditTarget: schedule.auditTarget,
      auditorLogin: schedule.auditor_login,
      auditorFullName: audit?.auditorFullName ?? null,
      plantId: schedule.plantId,
      plantName: schedule.plant?.designationPlant ?? null,
      score:
        audit?.score != null
          ? typeof audit.score === 'number'
            ? audit.score
            : audit.score.toNumber()
          : null,
    });
  }

  for (const audit of audits) {
    if (matchedAuditIds.has(audit.id) || !audit.startDate) continue;

    let state: 'planned' | 'in_progress' | 'done' | 'failed_ko' = 'in_progress';
    if (audit.eliminated) state = 'failed_ko';
    else if (audit.endDate) state = 'done';
    else {
      const derived = deriveAuditStatus({
        startDate: audit.startDate,
        endDate: audit.endDate,
        eliminated: audit.eliminated,
        detailsCount: audit._count.audit_details,
      });
      if (derived === 'Upcoming') state = 'planned';
      else if (derived === 'Missed') state = 'planned';
    }

    events.push({
      id: `audit-${audit.id}`,
      date: dateKey(audit.startDate),
      kind: 'audit',
      state,
      scheduleId: audit.scheduleId,
      auditId: audit.id,
      matchType: audit.scheduleId ? 'scheduleId' : null,
      title: audit.auditTypeName ?? audit.auditType ?? 'Audit',
      auditType: audit.auditType,
      auditTarget: audit.auditTarget,
      auditorLogin: audit.auditorLogin,
      auditorFullName: audit.auditorFullName,
      plantId: audit.plantId,
      plantName: audit.plant?.designationPlant ?? null,
      score:
        audit.score != null
          ? typeof audit.score === 'number'
            ? audit.score
            : audit.score.toNumber()
          : null,
    });
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

  return {
    year: query.year,
    month: query.month,
    matchingStrategy: {
      primary: 'audits.scheduleId === schedules.id',
      fallback:
        'same plantId + same auditor login (case-insensitive) + same calendar day (auditDate vs startDate)',
    },
    events,
  };
}

export async function resolveAuditorLoginsForSupervisor(supervisorId: string) {
  const affectations = await prisma.affectationUserUserChef.findMany({
    where: { UserIdSup: supervisorId },
    include: { user: { select: { UserName: true } } },
  });
  return affectations
    .map((aff) => aff.user?.UserName)
    .filter((login): login is string => !!login);
}

export async function resolveAuditorLoginForUser(userId: string) {
  const user = await prisma.aspnet_Users.findUnique({
    where: { UserId: userId },
    select: { UserName: true },
  });
  return user?.UserName ?? null;
}
