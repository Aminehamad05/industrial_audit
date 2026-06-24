import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

type Status = 'Pending' | 'Active' | 'Blocked' | 'Rejected';

const styles: Record<Status, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200/50',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  Blocked: 'bg-slate-100 text-slate-700 border-slate-200/50',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200/50',
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {t(`status_${status}`) || status}
    </span>
  );
};

export default StatusBadge;