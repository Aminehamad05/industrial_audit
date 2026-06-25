import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';
import { Card } from '../../components/dashboard/Card';

interface DashboardData {
  audits: Array<{
    id: number;
    auditTypeName: string;
    auditTarget: string;
    auditorFullName: string;
    plantId: number;
    startDate: string;
    endDate: string | null;
    score: number | null;
    status: 'Upcoming' | 'InProgress' | 'Completed';
  }>;
}

export const AdminKPIPanel: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const fullName = userData?.fullName || 'Admin';

  useEffect(() => {
    api.audits.dashboard()
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {});
  }, []);

  const audits = data?.audits ?? [];
  const total = audits.length;
  const upcoming = audits.filter((a) => a.status === 'Upcoming').length;
  const inProgress = audits.filter((a) => a.status === 'InProgress').length;
  const completed = audits.filter((a) => a.status === 'Completed').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {t('welcome')}, {fullName}!
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          {t('logged_in_as')}: <span className="text-hutchinson-blue font-bold">{t('role_Administrator')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title={t('total_audits')} value={total} accent="blue" />
        <Card title={t('upcoming_audits')} value={upcoming} accent="amber" />
        <Card title={t('in_progress_audits')} value={inProgress} accent="rose" />
        <Card title={t('completed_audits')} value={completed} accent="emerald" />
      </div>
    </div>
  );
};

export default AdminKPIPanel;
