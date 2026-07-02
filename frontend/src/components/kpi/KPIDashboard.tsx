import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';
import { Card } from '../dashboard/Card';

export interface KpiData {
  summary: {
    total: number;
    completed: number;
    missed: number;
    upcoming: number;
    inProgress: number;
    eliminated: number;
    passed: number;
    passRate: number | null;
    avgScore: number | null;
  };
  completionBreakdown: {
    completed: number;
    missed: number;
    upcoming: number;
    inProgress: number;
    eliminated: number;
  };
  scoreTrend: Array<{
    period: string;
    avgScore: number | null;
    passCount: number;
    failCount: number;
    eliminatedCount: number;
    total: number;
  }>;
  byAuditor: Array<{
    auditorLogin: string;
    auditorFullName: string;
    total: number;
    completed: number;
    passed: number;
    eliminated: number;
    missed: number;
    passRate: number | null;
    avgScore: number | null;
    monthAvgScore: number | null;
    monthEliminated: number;
  }>;
  byPlant: Array<{
    plantId: number;
    plantName: string;
    total: number;
    completed: number;
    passed: number;
    eliminated: number;
    missed: number;
    passRate: number | null;
    avgScore: number | null;
    monthAvgScore: number | null;
    monthEliminated: number;
  }>;
  recurringFailures: Array<{
    groupName: string;
    groupNameEng: string;
    question: string;
    questionEng: string;
    nokCount: number;
    answeredCount: number;
    nokRate: number;
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning';
    type: string;
    label: string;
    detail: string;
    value: number | null;
  }>;
}

interface PlantOption {
  idPlant: number;
  designationPlant: string | null;
}

interface KPIDashboardProps {
  welcomeName?: string;
  roleLabel?: string;
  scoped?: boolean;
}

const COMPLETION_COLORS = ['#10b981', '#f59e0b', '#64748b', '#3b82f6', '#dc2626'];

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  welcomeName,
  roleLabel,
  scoped = false,
}) => {
  const { t, language } = useLanguage();
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plantId, setPlantId] = useState('');
  const [auditType, setAuditType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    api.plants.list().then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setPlants(data.plants || data || []);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.audits
      .kpis({
        plantId: plantId ? Number(plantId) : undefined,
        auditType: auditType || undefined,
        from: from || undefined,
        to: to || undefined,
      })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setKpis(data.kpis);
      })
      .catch(() => setError(t('err_fetch_kpis')))
      .finally(() => setLoading(false));
  }, [plantId, auditType, from, to, t]);

  const completionChartData = useMemo(() => {
    if (!kpis) return [];
    const b = kpis.completionBreakdown;
    return [
      { name: t('passed'), value: kpis.summary.passed, key: 'passed' },
      { name: t('kpi_eliminated'), value: b.eliminated, key: 'eliminated' },
      { name: t('in_progress_audits'), value: b.inProgress, key: 'in_progress' },
      { name: t('upcoming_audits'), value: b.upcoming, key: 'upcoming' },
      { name: t('kpi_missed'), value: b.missed, key: 'missed' },
    ].filter((row) => row.value > 0);
  }, [kpis, t]);

  const trendData = kpis?.scoreTrend ?? [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {(welcomeName || roleLabel) && (
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {t('welcome')}, {welcomeName}!
          </h1>
          {roleLabel && (
            <p className="text-slate-500 font-medium text-sm">
              {t('logged_in_as')}: <span className="text-hutchinson-blue font-bold">{roleLabel}</span>
              {scoped && (
                <span className="ml-2 text-slate-400">· {t('kpi_scoped_supervisor')}</span>
              )}
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('col_plant')}</label>
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white min-w-[140px]"
            >
              <option value="">{t('all')}</option>
              {plants.map((p) => (
                <option key={p.idPlant} value={p.idPlant}>
                  {p.designationPlant || `Plant ${p.idPlant}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('audit_type')}</label>
            <input
              value={auditType}
              onChange={(e) => setAuditType(e.target.value)}
              placeholder={t('audit_type')}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg min-w-[140px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('kpi_from')}</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('kpi_to')}</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-hutchinson-red" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : kpis ? (
        <>
          {kpis.alerts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {kpis.alerts.map((alert, idx) => (
                <div
                  key={`${alert.type}-${idx}`}
                  className={`rounded-2xl border p-5 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-500">
                    {alert.severity === 'critical' ? t('kpi_alert_critical') : t('kpi_alert_warning')}
                  </div>
                  <div className="font-bold text-slate-900">{alert.label}</div>
                  <p className="text-sm text-slate-600 mt-1">
                    {t(alert.detail)} {alert.value !== null ? `(${alert.value}${alert.type.includes('score') || alert.type.includes('trend') ? '%' : ''})` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card title={t('total_audits')} value={kpis.summary.total} accent="blue" />
            <Card
              title={t('kpi_pass_rate')}
              value={kpis.summary.passRate !== null ? `${kpis.summary.passRate}%` : '—'}
              accent="emerald"
            />
            <Card
              title={t('kpi_avg_score')}
              value={kpis.summary.avgScore !== null ? `${kpis.summary.avgScore}%` : '—'}
              accent="blue"
            />
            <Card title={t('kpi_missed')} value={kpis.summary.missed} accent="amber" />
            <Card title={t('kpi_eliminated')} value={kpis.summary.eliminated} accent="rose" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-1">{t('kpi_score_trend')}</h3>
              <p className="text-xs text-slate-400 mb-4">{t('kpi_score_trend_desc')}</p>
              {trendData.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">{t('kpi_no_data')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgScore" name={t('kpi_avg_score')} stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                    <Bar yAxisId="right" dataKey="eliminatedCount" name={t('kpi_eliminated')} fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-1">{t('kpi_completion_breakdown')}</h3>
              <p className="text-xs text-slate-400 mb-4">{t('kpi_completion_breakdown_desc')}</p>
              {completionChartData.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">{t('kpi_no_data')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={completionChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {completionChartData.map((entry, index) => (
                        <Cell key={entry.key} fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">{t('kpi_by_plant')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={kpis.byPlant.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="plantName" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgScore" name={t('kpi_avg_score')} fill="#2563eb" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="passRate" name={t('kpi_pass_rate')} fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">{t('kpi_by_auditor')}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={kpis.byAuditor.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="auditorFullName" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgScore" name={t('kpi_avg_score')} stroke="#7c3aed" fill="#ddd6fe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-1">{t('kpi_recurring_failures')}</h3>
            <p className="text-xs text-slate-400 mb-4">{t('kpi_recurring_failures_desc')}</p>
            {kpis.recurringFailures.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">{t('kpi_no_failures')}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 text-xs font-bold text-slate-400 uppercase">
                      <th className="px-4 py-3">{t('group')}</th>
                      <th className="px-4 py-3">{t('questions')}</th>
                      <th className="px-4 py-3">{t('kpi_nok_count')}</th>
                      <th className="px-4 py-3">{t('kpi_nok_rate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.recurringFailures.map((row, idx) => (
                      <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50/40">
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {language === 'fr' ? row.groupName : row.groupNameEng}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {language === 'fr' ? row.question : row.questionEng}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-rose-600">{row.nokCount}</span>
                          <span className="text-slate-400 text-xs"> / {row.answeredCount}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-rose-600">{row.nokRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default KPIDashboard;
