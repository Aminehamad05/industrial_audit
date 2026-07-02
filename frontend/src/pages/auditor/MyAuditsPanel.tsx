import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyState } from '../../components/dashboard/EmptyState';
import api from '../../services/api.service';

type AuditFilter = 'All' | 'Planned' | 'In Progress' | 'Completed' | 'Missed';

interface AuditRow {
  id: number;
  auditTypeName: string;
  auditTarget: string;
  auditorFullName: string;
  auditorLogin: string;
  auditShiftName: string;
  plantId: number;
  supervisorName: string;
  startDate: string;
  endDate: string | null;
  score: number | null;
  eliminated: boolean;
  derivedStatus: string;
}

const STATUS_MAP: Record<string, string> = {
  Upcoming: 'Planned',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Failed: 'Completed',
  Missed: 'Missed',
};

const auditStatusStyles: Record<string, string> = {
  Planned: 'bg-slate-100 text-slate-700 border-slate-200/50',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200/20',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  Missed: 'bg-rose-50 text-rose-700 border-rose-200/50',
};

const FILTER_TO_STATUS: Record<string, string | undefined> = {
  All: undefined,
  Planned: 'upcoming',
  'In Progress': 'in_progress',
  Completed: 'completed',
  Missed: 'missed',
};

export const MyAuditsPanel: React.FC = () => {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [filter, setFilter] = useState<AuditFilter>('All');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const username = userData?.username;

  const fetchAudits = () => {
    if (!username) {
      setErrorMsg(t('err_session') || 'Session expired.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg('');

    const statusParam = FILTER_TO_STATUS[filter];
    api.audits.list({ auditorLogin: username, status: statusParam })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAudits(data.audits || []);
      })
      .catch(() => setErrorMsg(t('err_fetch_audits') || 'Failed to load audits.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudits();
  }, [filter]);

  const handleOpen = (id: number) => {
    console.log('Open audit', id);
  };

  const handleContinue = (id: number) => {
    console.log('Continue audit', id);
  };

  const filters: AuditFilter[] = ['All', 'Planned', 'In Progress', 'Completed', 'Missed'];

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('my_audits') || 'My Audits'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{t('my_audits_desc') || 'View and manage your assigned audits.'}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start md:self-auto select-none">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                filter === f
                  ? 'bg-white text-hutchinson-blue shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t(f === 'All' ? 'all' : `audit_status_${f.replace(' ', '_')}`) || f}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-hutchinson-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : audits.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title={t('no_audits') || 'No audits found'}
          description={t('no_audits_desc') || 'No audits match the current filter.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase select-none">
                <th className="px-6 py-4">{t('col_audit') || 'Audit'}</th>
                <th className="px-6 py-4">{t('col_plant') || 'Plant'}</th>
                <th className="px-6 py-4">{t('col_type') || 'Type'}</th>
                <th className="px-6 py-4">{t('col_date') || 'Date'}</th>
                <th className="px-6 py-4">{t('col_status')}</th>
                <th className="px-6 py-4 text-right">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => {
                const displayStatus = STATUS_MAP[a.derivedStatus] || a.derivedStatus;
                return (
                  <tr key={a.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{a.auditTypeName}</div>
                      <div className="text-slate-400 text-xs font-medium">{a.auditTarget}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">#{a.plantId}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">{a.auditShiftName || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{formatDate(a.startDate)}</td>
                    <td className="px-6 py-4 select-none">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${auditStatusStyles[displayStatus]}`}
                      >
                        {t(`audit_status_${displayStatus.replace(' ', '_')}`) || displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right select-none">
                      <div className="flex justify-end gap-1.5">
                        {displayStatus === 'Planned' && (
                          <button
                            onClick={() => handleOpen(a.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-hutchinson-blue text-white rounded-lg hover:opacity-90 hover:shadow-sm transition-all duration-200 cursor-pointer"
                          >
                            {t('btn_open') || 'Open'}
                          </button>
                        )}
                        {displayStatus === 'In Progress' && (
                          <button
                            onClick={() => handleContinue(a.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-hutchinson-blue text-white rounded-lg hover:opacity-90 hover:shadow-sm transition-all duration-200 cursor-pointer"
                          >
                            {t('btn_continue') || 'Continue'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAuditsPanel;