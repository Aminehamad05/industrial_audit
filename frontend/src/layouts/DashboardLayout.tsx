import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export interface DashboardTab {
  key: string;
  label: string; // already translated, or pass a translation key and translate here
}

interface DashboardLayoutProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const fullName = userData?.fullName || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col w-full text-left">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm w-full select-none">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Hutchinson Logo"
            className="h-8 w-auto object-contain select-none cursor-pointer"
            onClick={() => onTabChange(tabs[0]?.key)}
          />
          <span className="h-5 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hutchinson-blue text-white font-bold flex items-center justify-center text-sm shadow-sm select-none">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs font-semibold text-slate-600 max-w-[120px] truncate">
              {fullName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="h-5 w-[1px] bg-slate-200 mx-2" />

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/75 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('logout')}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow flex flex-col gap-8">
        {children}
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <LanguageToggle />
      </div>
    </div>
  );
};

export default DashboardLayout;