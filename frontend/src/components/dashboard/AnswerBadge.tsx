import React from 'react';

type AnswerType = 'OK' | 'NOK' | 'NC' | 'NA';

const styles: Record<AnswerType, string> = {
  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  NOK: 'bg-rose-50 text-rose-700 border-rose-200/50',
  NC: 'bg-amber-50 text-amber-700 border-amber-200/50',
  NA: 'bg-slate-100 text-slate-600 border-slate-200/50',
};

export const AnswerBadge: React.FC<{ answer: AnswerType }> = ({ answer }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[answer]}`}
  >
    {answer}
  </span>
);

export default AnswerBadge;
