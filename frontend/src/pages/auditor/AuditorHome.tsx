import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { AuditorDashboardPanel } from './AuditorDashboardPanel';
import { MyAuditsPanel } from './MyAuditsPanel';
import { FindingsPanel } from './FindingsPanel';
import { ReportsPanel } from './ReportsPanel';
import { AuditCalendar } from '../../components/calendar/AuditCalendar';

type AuditorTab = 'dashboard' | 'my_audits' | 'findings' | 'reports' | 'calendar';

export const AuditorHome: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AuditorTab>('dashboard');

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const fullName = userData?.fullName || 'Auditor';

  const tabs = [
    { key: 'dashboard', label: t('tab_dashboard') },
    { key: 'my_audits', label: t('tab_my_audits') },
    { key: 'findings', label: t('tab_findings') },
    { key: 'reports', label: t('tab_reports') },
    { key: 'calendar', label: t('tab_calendar') },
  ];

  return (
    <DashboardLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(key) => setActiveTab(key as AuditorTab)}
    >
      {activeTab === 'dashboard' && <AuditorDashboardPanel fullName={fullName} />}
      {activeTab === 'my_audits' && <MyAuditsPanel />}
      {activeTab === 'findings' && <FindingsPanel />}
      {activeTab === 'reports' && <ReportsPanel />}
      {activeTab === 'calendar' && <AuditCalendar scoped />}
    </DashboardLayout>
  );
};

export default AuditorHome;
