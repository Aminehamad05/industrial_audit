import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { KPIDashboard } from '../components/kpi/KPIDashboard';
import { AuditCalendar } from '../components/calendar/AuditCalendar';
import { SupervisorAssignPanel } from '../components/supervisor/SupervisorAssignPanel';
import api from '../services/api.service';

interface AuditDetailItem {
  id: number;
  groupName: string;
  groupNameEng: string;
  question: string;
  questionEng: string;
  answer: string | null;
  comment: string | null;
  answerOk: boolean;
  answerNok: boolean;
  answerNc: boolean;
  answerNa: boolean;
  ponderation: string | number;
  eliminatoire: boolean;
}

interface Audit {
  id: number;
  auditType: string | null;
  auditTypeName: string | null;
  auditTarget: string | null;
  auditorLogin: string | null;
  auditorFullName: string | null;
  startDate: string | null;
  endDate: string | null;
  score: string | number | null;
  comment: string | null;
  eliminated: boolean;
  plantId: number | null;
  derivedStatus?: string;
  audit_details?: AuditDetailItem[];
}

export const SupervisorDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected audit for detail viewing
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'upcoming' | 'in_progress' | 'completed' | 'failed' | 'missed'>('All');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load user data
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const supervisorId = userData?.id || '';
  const fullName = userData?.fullName || 'Supervisor';

  const fetchAudits = async () => {
    if (!supervisorId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const apiFilter = statusFilter === 'All' ? undefined : statusFilter;
      const res = await api.audits.list({ supervisorId, status: apiFilter });
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t('err_fetch_audits') || 'Failed to fetch audits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'audits') return;
    fetchAudits();
  }, [statusFilter, supervisorId, activeTab, refreshKey]);

  const viewAuditDetails = async (auditId: number) => {
    setLoadingDetail(true);
    try {
      const res = await api.audits.getById(auditId);
      if (res.ok) {
        const data = await res.json();
        setSelectedAudit(data.audit);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const tabs = [
    { key: 'dashboard', label: t('tab_dashboard') },
    { key: 'audits', label: t('supervised_audits') || 'Audits Supervised' },
    { key: 'calendar', label: t('tab_calendar') },
  ];

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'InProgress':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'Upcoming':
        return 'bg-slate-100 text-slate-700 border-slate-200/50';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      case 'Missed':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/50';
    }
  };

  return (
    <DashboardLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'dashboard' && (
        <KPIDashboard welcomeName={fullName} roleLabel={t('role_Supervisor')} scoped />
      )}

      {activeTab === 'calendar' && <AuditCalendar scoped />}

      {activeTab === 'audits' && (
      <div className="flex flex-col gap-6 w-full text-left font-sans">
        <SupervisorAssignPanel onAssigned={() => setRefreshKey((k) => k + 1)} />

        {/* Audits table container */}
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('supervised_audits') || 'Audits Supervised'}</h2>
              <p className="text-slate-500 text-xs mt-0.5">{t('supervised_audits_desc') || 'Review performance and results for auditors under your supervision.'}</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-auto select-none">
              {(['All', 'upcoming', 'in_progress', 'completed', 'failed', 'missed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-white text-hutchinson-blue shadow-sm border border-slate-100'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter === 'All' ? t('all') : t(`status_${filter}`) || filter}
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
              <svg className="animate-spin h-8 w-8 text-hutchinson-red" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : audits.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">No supervised audits found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100 select-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="px-6 py-4">{t('col_audit') || 'Audit Target'}</th>
                    <th className="px-6 py-4">{t('col_role') || 'Auditor'}</th>
                    <th className="px-6 py-4">{t('start_date') || 'Start Date'}</th>
                    <th className="px-6 py-4">{t('score') || 'Score'}</th>
                    <th className="px-6 py-4">{t('col_status') || 'Status'}</th>
                    <th className="px-6 py-4 text-right">{t('col_actions') || 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">
                          {a.auditTypeName || a.auditType || 'Audit'}
                        </div>
                        <div className="text-slate-400 text-xs font-semibold">{a.auditTarget || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-semibold">
                        {a.auditorFullName || `@${a.auditorLogin}`}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                        {a.startDate ? new Date(a.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">
                        {a.score !== null ? (
                          <span className={Number(a.score) >= 80 ? 'text-emerald-600' : 'text-rose-600'}>
                            {Number(a.score).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(a.derivedStatus)}`}>
                          {a.derivedStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewAuditDetails(a.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer transition-colors shadow-sm"
                        >
                          {t('view_details') || 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-3xl w-full flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 text-left">
                  {t('audit_details') || 'Audit Details'} — {selectedAudit.auditTypeName || selectedAudit.auditType}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 text-left">
                  {t('conducted_by') || 'Conducted by'} <span className="font-semibold text-slate-600">{selectedAudit.auditorFullName}</span> on {selectedAudit.startDate ? new Date(selectedAudit.startDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-left">
              {/* Score / KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('score') || 'Score'}</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {selectedAudit.score !== null ? `${Number(selectedAudit.score).toFixed(1)}%` : '—'}
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('col_status') || 'Status'}</div>
                  <div className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(selectedAudit.derivedStatus)}`}>
                    {selectedAudit.derivedStatus}
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('col_plant') || 'Plant'}</div>
                  <div className="text-base font-bold text-slate-800 mt-1">Plant #{selectedAudit.plantId || 'N/A'}</div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('result') || 'Result'}</div>
                  <div className={`text-sm font-bold mt-1 ${selectedAudit.eliminated ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedAudit.eliminated ? (t('failed_ko') || 'FAILED (Knockout)') : (t('passed') || 'PASSED')}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selectedAudit.comment && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('comment_title') || 'Supervisor/Auditor Comment'}</h4>
                  <p className="text-sm text-slate-700 font-medium">{selectedAudit.comment}</p>
                </div>
              )}

              {/* Questions List */}
              <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">{t('questionnaire_answers') || 'Questionnaire Answers'}</h4>

              {(!selectedAudit.audit_details || selectedAudit.audit_details.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-sm font-medium">{t('no_answers_recorded') || 'No answers recorded for this audit.'}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedAudit.audit_details.map((detail) => {
                    let ansLabel = 'N/A';
                    let ansColor = 'text-slate-500 bg-slate-100 border-slate-200';
                    if (detail.answerOk) {
                      ansLabel = 'OK';
                      ansColor = 'text-emerald-600 bg-emerald-50 border-emerald-200/50';
                    } else if (detail.answerNok) {
                      ansLabel = 'NOK';
                      ansColor = 'text-rose-600 bg-rose-50 border-rose-200/50';
                    } else if (detail.answerNc) {
                      ansLabel = 'NC';
                      ansColor = 'text-amber-600 bg-amber-50 border-amber-200/50';
                    }

                    return (
                      <div key={detail.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 flex items-start gap-4 justify-between">
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {language === 'fr' ? detail.groupName : detail.groupNameEng} (Q{detail.id})
                          </span>
                          <p className="text-sm font-bold text-slate-800">
                            {language === 'fr' ? detail.question : detail.questionEng}
                          </p>
                          {detail.comment && (
                            <p className="text-xs font-semibold text-slate-500 mt-1 italic">
                              Note: "{detail.comment}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 select-none shrink-0">
                          {detail.eliminatoire && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-100 border border-red-200 text-red-700">KO</span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${ansColor}`}>
                            {ansLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setSelectedAudit(null)}
              className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              {t('btn_close') || 'Close'}
            </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SupervisorDashboard;