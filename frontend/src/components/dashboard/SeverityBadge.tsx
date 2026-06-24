import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const severity = ['Low', 'Medium', 'High', 'Critical'] as const;
export type Severity = (typeof severity)[number];

const styles: Record<Severity, string> = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200/50',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200/50',
  High: 'bg-rose-50 text-rose-700 border-rose-200/50',
  Critical: 'bg-red-100 text-red-800 border-red-300',
};

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[severity]}`}
    >
      {t(`severity_${severity}`) || severity}
    </span>
  );
};

export default SeverityBadge;
