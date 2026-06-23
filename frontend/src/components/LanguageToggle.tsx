import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-[8px] border border-slate-200/60 backdrop-blur-sm select-none shadow-sm">
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`px-2.5 py-1 text-xs font-bold rounded-[6px] transition-all duration-200 cursor-pointer ${
          language === 'fr'
            ? 'bg-white text-hutchinson-blue shadow-[0_2px_6px_rgba(11,25,117,0.08)]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-[6px] transition-all duration-200 cursor-pointer ${
          language === 'en'
            ? 'bg-white text-hutchinson-blue shadow-[0_2px_6px_rgba(11,25,117,0.08)]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
