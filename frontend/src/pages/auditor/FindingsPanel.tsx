import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SeverityBadge } from '../../components/dashboard/SeverityBadge';
import { FindingStatusBadge } from '../../components/dashboard/FindingStatusBadge';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { mockFindings } from './mockAuditorData';
import type { Finding } from './mockAuditorData';

type StatusFilter = 'All' | 'Open' | 'In Review' | 'Closed';

export const FindingsPanel: React.FC = () => {
  const { t } = useLanguage();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFindings = () => {
    setLoading(true);
    setErrorMsg('');
    // TODO: Replace with real API call once auditor endpoints exist
    setTimeout(() => {
      try {
        let filtered = mockFindings;
        if (filter !== 'All') {
          filtered = mockFindings.filter((f) => f.status === filter);
        }
        setFindings(filtered);
      } catch {
        setErrorMsg(t('err_fetch_findings') || 'Failed to load findings.');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  useEffect(() => {
    fetchFindings();
  }, [filter]);

  const handleView = (id: string) => {
    // TODO: Navigate to finding detail or open modal
    console.log('View finding', id);
  };

  const filters: StatusFilter[] = ['All', 'Open', 'In Review', 'Closed'];

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('findings') || 'Findings'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{t('findings_desc') || 'Review and track audit findings.'}</p>
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
              {t(f === 'All' ? 'all' : `finding_status_${f.replace(' ', '_')}`) || f}
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
      ) : findings.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title={t('no_findings') || 'No findings found'}
          description={t('no_findings_desc') || 'No findings match the current filter.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase select-none">
                <th className="px-6 py-4">{t('col_id') || 'ID'}</th>
                <th className="px-6 py-4">{t('col_audit') || 'Audit'}</th>
                <th className="px-6 py-4">{t('col_severity') || 'Severity'}</th>
                <th className="px-6 py-4">{t('col_status')}</th>
                <th className="px-6 py-4 text-right">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono font-medium">{f.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{f.auditName}</div>
                    <div className="text-slate-400 text-xs font-medium">{f.description}</div>
                  </td>
                  <td className="px-6 py-4 select-none">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="px-6 py-4 select-none">
                    <FindingStatusBadge status={f.status} />
                  </td>
                  <td className="px-6 py-4 text-right select-none">
                    <button
                      onClick={() => handleView(f.id)}
                      className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    >
                      {t('btn_view') || 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FindingsPanel;
