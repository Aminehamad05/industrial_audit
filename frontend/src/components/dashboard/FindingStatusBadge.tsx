import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const statuses = ['Open', 'In Review', 'Closed'] as const;
export type FindingStatus = (typeof statuses)[number];

const styles: Record<FindingStatus, string> = {
  Open: 'bg-rose-50 text-rose-700 border-rose-200/50',
  'In Review': 'bg-amber-50 text-amber-700 border-amber-200/50',
  Closed: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
};

export const FindingStatusBadge: React.FC<{ status: FindingStatus }> = ({ status }) => {
  const { t } = useLanguage();
  const key = `finding_status_${status.replace(' ', '_')}`;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {t(key) || status}
    </span>
  );
};

export default FindingStatusBadge;
