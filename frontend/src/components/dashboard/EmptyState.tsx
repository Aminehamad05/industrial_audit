import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8 animate-fade-in w-full text-center py-16">
    <div className="max-w-md mx-auto flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 select-none">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 font-medium text-sm">{description}</p>
    </div>
  </div>
);

export default EmptyState;