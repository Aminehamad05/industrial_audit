import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { UserManagementPanel } from './UserManagementPanel';
import { AdminKPIPanel } from './AdminKPIPanel';
import { AuditManagementPanel } from './AuditManagementPanel';
import { AuditResultsPanel } from './AuditResultsPanel';

type AdminTab = 'dashboard' | 'create_audit' | 'audit_results' | 'users';

export const AdminHome: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { key: 'dashboard', label: t('tab_dashboard') },
    { key: 'create_audit', label: t('tab_create_audit') },
    { key: 'audit_results', label: t('tab_audit_results') },
    { key: 'users', label: t('tab_user_management') },
  ];

  return (
    <DashboardLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(key) => setActiveTab(key as AdminTab)}
    >
      {activeTab === 'dashboard' && <AdminKPIPanel />}
      {activeTab === 'create_audit' && <AuditManagementPanel />}
      {activeTab === 'audit_results' && <AuditResultsPanel />}
      {activeTab === 'users' && <UserManagementPanel />}
    </DashboardLayout>
  );
};

export default AdminHome;