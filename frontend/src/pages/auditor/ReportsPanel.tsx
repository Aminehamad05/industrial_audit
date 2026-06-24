import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { mockReports } from './mockAuditorData';
import type { Report } from './mockAuditorData';

const reportStatusStyles: Record<string, string> = {
  Draft: 'bg-amber-50 text-amber-700 border-amber-200/50',
  Submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
};

export const ReportsPanel: React.FC = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReports = () => {
    setLoading(true);
    setErrorMsg('');
    // TODO: Replace with real API call once auditor endpoints exist
    setTimeout(() => {
      try {
        setReports(mockReports);
      } catch {
        setErrorMsg(t('err_fetch_reports') || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleView = (id: string) => {
    // TODO: Navigate to report detail
    console.log('View report', id);
  };

  const handleDownload = (id: string) => {
    // TODO: Generate and download PDF
    console.log('Download report PDF', id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('reports') || 'Reports'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{t('reports_desc') || 'View and download audit reports.'}</p>
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
      ) : reports.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title={t('no_reports') || 'No reports found'}
          description={t('no_reports_desc') || 'No reports are available yet.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase select-none">
                <th className="px-6 py-4">{t('col_report') || 'Report'}</th>
                <th className="px-6 py-4">{t('col_date') || 'Date'}</th>
                <th className="px-6 py-4">{t('col_audit') || 'Audit'}</th>
                <th className="px-6 py-4">{t('col_status')}</th>
                <th className="px-6 py-4 text-right">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{r.title}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-medium">{r.date}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-medium">{r.auditName}</td>
                  <td className="px-6 py-4 select-none">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${reportStatusStyles[r.status]}`}
                    >
                      {t(`report_status_${r.status}`) || r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right select-none">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleView(r.id)}
                        className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      >
                        {t('btn_view') || 'View'}
                      </button>
                      <button
                        onClick={() => handleDownload(r.id)}
                        className="px-2.5 py-1.5 text-xs font-bold bg-hutchinson-blue text-white rounded-lg hover:opacity-90 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      >
                        {t('btn_download_pdf') || 'Download PDF'}
                      </button>
                    </div>
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

export default ReportsPanel;
