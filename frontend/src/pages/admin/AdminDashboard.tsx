import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { UserManagementPanel } from './UserManagementPanel';
import { EmptyState } from '../../components/dashboard/EmptyState';

type AdminTab = 'dashboard' | 'users' | 'audit_results';

export const AdminHome: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const fullName = userData?.fullName || 'Admin';

  const tabs = [
    { key: 'dashboard', label: t('tab_dashboard') },
    { key: 'audit_results', label: t('tab_audit_results') },
    { key: 'users', label: t('tab_user_management') },
  ];

  return (
    <DashboardLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(key) => setActiveTab(key as AdminTab)}
    >
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8 animate-fade-in w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {t('welcome')}, {fullName}!
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {t('logged_in_as')}: <span className="text-hutchinson-blue font-bold">{t('role_Admin')}</span>
          </p>
        </div>
      )}

      {activeTab === 'audit_results' && (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title={t('coming_soon')}
          description={t('coming_soon_desc')}
        />
      )}

      {activeTab === 'users' && <UserManagementPanel />}
    </DashboardLayout>
  );
};

export default AdminHome;