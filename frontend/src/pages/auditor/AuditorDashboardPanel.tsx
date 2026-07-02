import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/dashboard/Card';
import api from '../../services/api.service';

interface AuditorDashboardPanelProps {
  fullName: string;
}

interface AuditRow {
  id: number;
  auditTypeName: string;
  auditTarget: string;
  auditorFullName: string;
  auditShiftName: string;
  plantId: number;
  supervisorName: string;
  startDate: string;
  endDate: string | null;
  score: number | null;
  eliminated: boolean;
  derivedStatus: string;
  _count?: { audit_details: number };
}

export const AuditorDashboardPanel: React.FC<AuditorDashboardPanelProps> = ({ fullName }) => {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const username = userData?.username;

  useEffect(() => {
    if (!username) {
      setError(t('err_session') || 'Session expired. Please log in again.');
      setLoading(false);
      return;
    }
    api.audits.list({ auditorLogin: username })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAudits(data.audits || []);
      })
      .catch(() => setError(t('err_fetch_audits') || 'Failed to load audits.'))
      .finally(() => setLoading(false));
  }, [username, t]);

  const stats = {
    assigned: audits.length,
    completed: audits.filter((a) => a.derivedStatus === 'Completed' || a.derivedStatus === 'Failed').length,
    pending: audits.filter((a) => a.derivedStatus === 'Upcoming' || a.derivedStatus === 'InProgress').length,
    missed: audits.filter((a) => a.derivedStatus === 'Missed').length,
  };

  const upcomingAudits = audits
    .filter((a) => a.derivedStatus === 'Upcoming')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const recentAudits = audits
    .filter((a) => a.derivedStatus === 'Completed' || a.derivedStatus === 'InProgress')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return t('today') || 'Today';
    if (diff === 1) return t('tomorrow') || 'Tomorrow';
    if (diff > 0) return t('in_days')?.replace('{n}', String(diff)) || `In ${diff} days`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-hutchinson-red" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t('welcome')}, {fullName}!
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          {t('auditor_summary') || `You have ${stats.assigned} audits assigned.`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title={t('assigned_audits') || 'Assigned'} value={stats.assigned} accent="blue" />
        <Card title={t('completed_audits') || 'Completed'} value={stats.completed} accent="emerald" />
        <Card title={t('pending_audits') || 'Pending'} value={stats.pending} accent="amber" />
        <Card title={t('missed_audits') || 'Missed'} value={stats.missed} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            {t('upcoming_audits') || 'Upcoming Audits'}
          </h3>
          {upcomingAudits.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">{t('no_upcoming_audits') || 'No upcoming audits'}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingAudits.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{a.auditTypeName}</span>
                    <p className="text-xs text-slate-400">{a.auditTarget}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                    {formatDate(a.startDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            {t('recent_audits') || 'Recent Audits'}
          </h3>
          {recentAudits.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">{t('no_recent_audits') || 'No recent audits'}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentAudits.map((a) => {
                const isCompleted = a.derivedStatus === 'Completed';
                return (
                  <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-b-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-700">{a.auditTypeName}</span>
                      <p className="text-xs text-slate-400 truncate">{a.auditTarget}</p>
                    </div>
                    {a.score !== null && (
                      <span className={`text-xs font-bold ${a.score >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {a.score}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboardPanel;