import React from 'react';

interface CardProps {
  title: string;
  value: number | string;
  accent?: 'blue' | 'emerald' | 'amber' | 'rose';
}

const accentText: Record<string, string> = {
  blue: 'text-hutchinson-blue',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
};

export const Card: React.FC<CardProps> = ({ title, value, accent = 'blue' }) => (
  <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col gap-1 border-l-4 animate-fade-in select-none">
    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{title}</span>
    <span className={`text-3xl font-bold ${accentText[accent]}`}>{value}</span>
  </div>
);

export default Card;
