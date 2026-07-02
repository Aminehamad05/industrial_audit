import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { KPIDashboard } from '../../components/kpi/KPIDashboard';

export const AdminKPIPanel: React.FC = () => {
  const { t } = useLanguage();
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const fullName = userData?.fullName || 'Admin';

  return (
    <KPIDashboard
      welcomeName={fullName}
      roleLabel={t('role_Administrator')}
    />
  );
};

export default AdminKPIPanel;
