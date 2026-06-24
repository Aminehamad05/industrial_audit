import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/dashboard/Card';
import { SeverityBadge } from '../../components/dashboard/SeverityBadge';
import {
  mockDashboardStats,
  mockUpcomingAudits,
  mockRecentFindings,
} from './mockAuditorData';

interface AuditorDashboardPanelProps {
  fullName: string;
}

export const AuditorDashboardPanel: React.FC<AuditorDashboardPanelProps> = ({ fullName }) => {
  const { t } = useLanguage();

  const stats = mockDashboardStats;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t('welcome')}, {fullName}!
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          {t('auditor_summary') || `You have ${stats.assigned} audits assigned, ${stats.dueToday} due today, ${stats.openFindings} open findings, and ${stats.pendingReports} reports awaiting submission.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title={t('assigned_audits') || 'Assigned'} value={stats.assigned} accent="blue" />
        <Card title={t('completed_audits') || 'Completed'} value={stats.completed} accent="emerald" />
        <Card title={t('pending_audits') || 'Pending'} value={stats.pending} accent="amber" />
        <Card title={t('open_findings') || 'Open Findings'} value={stats.openFindings} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            {t('upcoming_audits') || 'Upcoming Audits'}
          </h3>
          <div className="flex flex-col gap-3">
            {mockUpcomingAudits.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0">
                <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                  {a.relativeDue}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            {t('recent_findings') || 'Recent Findings'}
          </h3>
          <div className="flex flex-col gap-3">
            {mockRecentFindings.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-b-0">
                <SeverityBadge severity={f.severity} />
                <span className="text-sm font-medium text-slate-700">{f.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboardPanel;
