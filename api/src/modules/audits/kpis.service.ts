import { prisma } from '../../db/prisma';
import { deriveAuditStatus } from './audits.service';

export interface KpiQueryFilters {
  plantId?: number;
  auditorLogin?: string;
  auditType?: string;
  from?: Date;
  to?: Date;
  supervisorId?: string;
}

type AuditRow = {
  id: number;
  auditType: string | null;
  auditTypeName: string | null;
  auditorLogin: string | null;
  auditorFullName: string | null;
  plantId: number | null;
  startDate: Date | null;
  endDate: Date | null;
  score: { toNumber(): number } | number | null;
  eliminated: boolean;
  _count: { audit_details: number };
  plant: { designationPlant: string | null } | null;
};

function toNumber(value: { toNumber(): number } | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'number' ? value : value.toNumber();
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function resolveAuditorLogins(supervisorId: string): Promise<string[]> {
  const affectations = await prisma.affectationUserUserChef.findMany({
    where: { UserIdSup: supervisorId },
    include: { user: { select: { UserName: true } } },
  });
  return affectations
    .map((aff) => aff.user?.UserName)
    .filter((login): login is string => !!login);
}

async function buildAuditWhere(filters: KpiQueryFilters) {
  const where: Record<string, unknown> = {};

  if (filters.plantId) where.plantId = filters.plantId;
  if (filters.auditType) where.auditType = filters.auditType;
  if (filters.auditorLogin) where.auditorLogin = filters.auditorLogin;

  if (filters.supervisorId) {
    const supervisor = await prisma.aspnet_Users.findUnique({
      where: { UserId: filters.supervisorId },
      select: { UserName: true },
    });
    const logins = await resolveAuditorLogins(filters.supervisorId);
    const scope: Record<string, unknown>[] = [];
    if (supervisor?.UserName) {
      scope.push({ supervisorLogin: supervisor.UserName });
    }
    if (logins.length > 0) {
      scope.push({ auditorLogin: { in: logins } });
    }
    if (filters.auditorLogin) {
      where.auditorLogin = filters.auditorLogin;
    } else if (scope.length > 0) {
      where.OR = scope;
    } else {
      where.auditorLogin = { in: ['__none__'] };
    }
  }

  if (filters.from || filters.to) {
    where.startDate = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }

  return where;
}

function classifyAudit(audit: AuditRow) {
  const status = deriveAuditStatus({
    startDate: audit.startDate,
    endDate: audit.endDate,
    eliminated: audit.eliminated,
    detailsCount: audit._count.audit_details,
  });
  const score = toNumber(audit.score);
  const passed =
    status === 'Completed' && !audit.eliminated;
  const knockout = audit.eliminated;
  return { status, score, passed, knockout };
}

export async function getAuditKpis(filters: KpiQueryFilters) {
  const where = await buildAuditWhere(filters);

  const audits = (await prisma.audits.findMany({
    where: where as any,
    select: {
      id: true,
      auditType: true,
      auditTypeName: true,
      auditorLogin: true,
      auditorFullName: true,
      plantId: true,
      startDate: true,
      endDate: true,
      score: true,
      eliminated: true,
      _count: { select: { audit_details: true } },
      plant: { select: { designationPlant: true } },
    },
    orderBy: { startDate: 'asc' },
  })) as AuditRow[];

  const auditIds = audits.map((a) => a.id);
  const now = new Date();
  const currentMonthStart = startOfMonth(now);

  let completed = 0;
  let missed = 0;
  let upcoming = 0;
  let inProgress = 0;
  let eliminated = 0;
  let passed = 0;
  let scoreSum = 0;
  let scoredCount = 0;

  const trendMap = new Map<
    string,
    { period: string; avgScore: number | null; passCount: number; failCount: number; eliminatedCount: number; total: number; scoreSum: number; scoredCount: number }
  >();

  const auditorMap = new Map<
    string,
    {
      auditorLogin: string;
      auditorFullName: string;
      total: number;
      completed: number;
      passed: number;
      eliminated: number;
      missed: number;
      scoreSum: number;
      scoredCount: number;
      monthScoreSum: number;
      monthScoredCount: number;
      monthEliminated: number;
    }
  >();

  const plantMap = new Map<
    number,
    {
      plantId: number;
      plantName: string;
      total: number;
      completed: number;
      passed: number;
      eliminated: number;
      missed: number;
      scoreSum: number;
      scoredCount: number;
      monthScoreSum: number;
      monthScoredCount: number;
      monthEliminated: number;
    }
  >();

  for (const audit of audits) {
    const { status, score, passed: isPassed, knockout } = classifyAudit(audit);

    if (status === 'Completed' || status === 'Failed') completed++;
    else if (status === 'Missed') missed++;
    else if (status === 'Upcoming') upcoming++;
    else if (status === 'InProgress') inProgress++;

    if (knockout) eliminated++;
    if (isPassed) {
      passed++;
      if (score !== null) {
        scoreSum += score;
        scoredCount++;
      }
    } else if (status === 'Completed' && !knockout && score !== null) {
      scoreSum += score;
      scoredCount++;
    }

    const trendDate = audit.endDate ?? audit.startDate;
    if (trendDate) {
      const key = monthKey(new Date(trendDate));
      const bucket = trendMap.get(key) ?? {
        period: key,
        avgScore: null,
        passCount: 0,
        failCount: 0,
        eliminatedCount: 0,
        total: 0,
        scoreSum: 0,
        scoredCount: 0,
      };
      bucket.total++;
      if (knockout) {
        bucket.eliminatedCount++;
        bucket.failCount++;
      } else if (isPassed) {
        bucket.passCount++;
        if (score !== null) {
          bucket.scoreSum += score;
          bucket.scoredCount++;
        }
      } else if (status === 'Completed') {
        bucket.failCount++;
        if (score !== null) {
          bucket.scoreSum += score;
          bucket.scoredCount++;
        }
      }
      trendMap.set(key, bucket);
    }

    const login = audit.auditorLogin ?? 'unknown';
    const auditorEntry =
      auditorMap.get(login) ??
      {
        auditorLogin: login,
        auditorFullName: audit.auditorFullName ?? login,
        total: 0,
        completed: 0,
        passed: 0,
        eliminated: 0,
        missed: 0,
        scoreSum: 0,
        scoredCount: 0,
        monthScoreSum: 0,
        monthScoredCount: 0,
        monthEliminated: 0,
      };
    auditorEntry.total++;
    if (status === 'Completed' || status === 'Failed') auditorEntry.completed++;
    if (isPassed) auditorEntry.passed++;
    if (knockout) auditorEntry.eliminated++;
    if (status === 'Missed') auditorEntry.missed++;
    if (score !== null && (status === 'Completed' || status === 'Failed')) {
      auditorEntry.scoreSum += score;
      auditorEntry.scoredCount++;
    }
    if (audit.startDate && new Date(audit.startDate) >= currentMonthStart) {
      if (knockout) auditorEntry.monthEliminated++;
      if (score !== null && (status === 'Completed' || status === 'Failed')) {
        auditorEntry.monthScoreSum += score;
        auditorEntry.monthScoredCount++;
      }
    }
    auditorMap.set(login, auditorEntry);

    if (audit.plantId) {
      const plantEntry =
        plantMap.get(audit.plantId) ??
        {
          plantId: audit.plantId,
          plantName: audit.plant?.designationPlant ?? `Plant ${audit.plantId}`,
          total: 0,
          completed: 0,
          passed: 0,
          eliminated: 0,
          missed: 0,
          scoreSum: 0,
          scoredCount: 0,
          monthScoreSum: 0,
          monthScoredCount: 0,
          monthEliminated: 0,
        };
      plantEntry.total++;
      if (status === 'Completed' || status === 'Failed') plantEntry.completed++;
      if (isPassed) plantEntry.passed++;
      if (knockout) plantEntry.eliminated++;
      if (status === 'Missed') plantEntry.missed++;
      if (score !== null && (status === 'Completed' || status === 'Failed')) {
        plantEntry.scoreSum += score;
        plantEntry.scoredCount++;
      }
      if (audit.startDate && new Date(audit.startDate) >= currentMonthStart) {
        if (knockout) plantEntry.monthEliminated++;
        if (score !== null && (status === 'Completed' || status === 'Failed')) {
          plantEntry.monthScoreSum += score;
          plantEntry.monthScoredCount++;
        }
      }
      plantMap.set(audit.plantId, plantEntry);
    }
  }

  const scoreTrend = [...trendMap.values()]
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((bucket) => ({
      period: bucket.period,
      avgScore: bucket.scoredCount > 0 ? Math.round((bucket.scoreSum / bucket.scoredCount) * 10) / 10 : null,
      passCount: bucket.passCount,
      failCount: bucket.failCount,
      eliminatedCount: bucket.eliminatedCount,
      total: bucket.total,
    }));

  const byAuditor = [...auditorMap.values()]
    .map((row) => ({
      auditorLogin: row.auditorLogin,
      auditorFullName: row.auditorFullName,
      total: row.total,
      completed: row.completed,
      passed: row.passed,
      eliminated: row.eliminated,
      missed: row.missed,
      passRate: row.completed > 0 ? Math.round((row.passed / row.completed) * 1000) / 10 : null,
      avgScore: row.scoredCount > 0 ? Math.round((row.scoreSum / row.scoredCount) * 10) / 10 : null,
      monthAvgScore:
        row.monthScoredCount > 0 ? Math.round((row.monthScoreSum / row.monthScoredCount) * 10) / 10 : null,
      monthEliminated: row.monthEliminated,
    }))
    .sort((a, b) => (a.avgScore ?? 0) - (b.avgScore ?? 0));

  const byPlant = [...plantMap.values()]
    .map((row) => ({
      plantId: row.plantId,
      plantName: row.plantName,
      total: row.total,
      completed: row.completed,
      passed: row.passed,
      eliminated: row.eliminated,
      missed: row.missed,
      passRate: row.completed > 0 ? Math.round((row.passed / row.completed) * 1000) / 10 : null,
      avgScore: row.scoredCount > 0 ? Math.round((row.scoreSum / row.scoredCount) * 10) / 10 : null,
      monthAvgScore:
        row.monthScoredCount > 0 ? Math.round((row.monthScoreSum / row.monthScoredCount) * 10) / 10 : null,
      monthEliminated: row.monthEliminated,
    }))
    .sort((a, b) => (a.avgScore ?? 0) - (b.avgScore ?? 0));

  let recurringFailures: Array<{
    groupName: string;
    groupNameEng: string;
    question: string;
    questionEng: string;
    nokCount: number;
    answeredCount: number;
    nokRate: number;
  }> = [];

  if (auditIds.length > 0) {
    const [nokGroups, answeredGroups] = await Promise.all([
      prisma.audit_details.groupBy({
        by: ['groupName', 'groupNameEng', 'question', 'questionEng'],
        where: { auditId: { in: auditIds }, answerNok: true },
        _count: { _all: true },
      }),
      prisma.audit_details.groupBy({
        by: ['groupName', 'groupNameEng', 'question', 'questionEng'],
        where: {
          auditId: { in: auditIds },
          OR: [{ answerOk: true }, { answerNok: true }],
        },
        _count: { _all: true },
      }),
    ]);

    const answeredMap = new Map(
      answeredGroups.map((row) => [
        `${row.groupName}::${row.question}`,
        row._count._all,
      ])
    );

    recurringFailures = nokGroups
      .map((row) => {
        const answeredCount = answeredMap.get(`${row.groupName}::${row.question}`) ?? 0;
        const nokCount = row._count._all;
        return {
          groupName: row.groupName,
          groupNameEng: row.groupNameEng,
          question: row.question,
          questionEng: row.questionEng,
          nokCount,
          answeredCount,
          nokRate: answeredCount > 0 ? Math.round((nokCount / answeredCount) * 1000) / 10 : 0,
        };
      })
      .filter((row) => row.nokCount >= 1)
      .sort((a, b) => b.nokCount - a.nokCount || b.nokRate - a.nokRate)
      .slice(0, 10);
  }

  const alerts: Array<{
    severity: 'critical' | 'warning';
    type: string;
    label: string;
    detail: string;
    value: number | null;
  }> = [];

  const worstPlant = [...byPlant]
    .filter((p) => p.monthEliminated > 0)
    .sort((a, b) => b.monthEliminated - a.monthEliminated || (a.monthAvgScore ?? 100) - (b.monthAvgScore ?? 100))[0];

  if (worstPlant && worstPlant.monthEliminated > 0) {
    alerts.push({
      severity: 'critical',
      type: 'plant_knockout',
      label: worstPlant.plantName,
      detail: 'plant_knockout_detail',
      value: worstPlant.monthEliminated,
    });
  }

  const worstAuditor = [...byAuditor]
    .filter((a) => a.monthEliminated > 0 || (a.monthAvgScore !== null && a.monthAvgScore < 70))
    .sort((a, b) => b.monthEliminated - a.monthEliminated || (a.monthAvgScore ?? 100) - (b.monthAvgScore ?? 100))[0];

  if (worstAuditor) {
    alerts.push({
      severity: worstAuditor.monthEliminated > 0 ? 'critical' : 'warning',
      type: worstAuditor.monthEliminated > 0 ? 'auditor_knockout' : 'auditor_low_score',
      label: worstAuditor.auditorFullName,
      detail: worstAuditor.monthEliminated > 0 ? 'auditor_knockout_detail' : 'auditor_low_score_detail',
      value: worstAuditor.monthEliminated > 0 ? worstAuditor.monthEliminated : worstAuditor.monthAvgScore,
    });
  }

  const worstTrendPlant = [...byPlant]
    .filter((p) => p.monthAvgScore !== null)
    .sort((a, b) => (a.monthAvgScore ?? 100) - (b.monthAvgScore ?? 100))[0];
  if (worstTrendPlant && worstTrendPlant.monthAvgScore !== null && worstTrendPlant.monthAvgScore < 75) {
    alerts.push({
      severity: 'warning',
      type: 'plant_low_trend',
      label: worstTrendPlant.plantName,
      detail: 'plant_low_trend_detail',
      value: worstTrendPlant.monthAvgScore,
    });
  }

  const finished = completed;
  return {
    summary: {
      total: audits.length,
      completed: finished,
      missed,
      upcoming,
      inProgress,
      eliminated,
      passed,
      passRate: finished > 0 ? Math.round((passed / finished) * 1000) / 10 : null,
      avgScore: scoredCount > 0 ? Math.round((scoreSum / scoredCount) * 10) / 10 : null,
    },
    completionBreakdown: { completed: finished, missed, upcoming, inProgress, eliminated },
    scoreTrend,
    byAuditor,
    byPlant,
    recurringFailures,
    alerts,
  };
}
