import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';
import { AnswerBadge } from '../../components/dashboard/AnswerBadge';
import { EmptyState } from '../../components/dashboard/EmptyState';

interface AuditListItem {
  id: number;
  auditTypeName: string;
  auditTarget: string;
  auditorFullName: string;
  plantId: number;
  startDate: string;
  endDate: string | null;
  score: number | null;
  status: 'Upcoming' | 'InProgress' | 'Completed';
}

interface AuditDetailItem {
  id: number;
  groupPosition: number;
  groupName: string;
  groupNameEng: string;
  questionPosition: number;
  question: string;
  questionEng: string;
  answer: string | null;
  comment: string | null;
  answerOk: boolean;
  answerNok: boolean;
  answerNc: boolean;
  answerNa: boolean;
  photoPath: string | null;
}

interface AuditFull {
  id: number;
  auditType: string;
  auditTypeName: string;
  auditTarget: string;
  auditorFullName: string;
  auditorLogin: string;
  plantId: number;
  startDate: string;
  endDate: string | null;
  score: number | null;
  comment: string | null;
  derivedStatus: 'Upcoming' | 'InProgress' | 'Completed';
  details: AuditDetailItem[];
}

const statusStyles: Record<string, string> = {
  Upcoming: 'bg-amber-50 text-amber-700 border-amber-200/50',
  InProgress: 'bg-blue-50 text-blue-700 border-blue-200/50',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
};

function getAnswerType(detail: AuditDetailItem): string | null {
  if (detail.answerOk) return 'OK';
  if (detail.answerNok) return 'NOK';
  if (detail.answerNc) return 'NC';
  if (detail.answerNa) return 'NA';
  return null;
}

export const AuditResultsPanel: React.FC = () => {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<AuditListItem[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<AuditFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.audits.dashboard()
      .then((r) => r.json())
      .then((d) => setAudits(d.audits || []))
      .catch(() => setError(t('err_fetch_audits')))
      .finally(() => setLoading(false));
  }, []);

  const openAudit = async (id: number) => {
    setError('');
    try {
      const res = await api.audits.getById(id);
      const data = await res.json();
      if (!res.ok) { setError(data.error || t('err_fetch_audit')); return; }
      setSelectedAudit(data.audit);
    } catch {
      setError(t('err_fetch_audit'));
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8 animate-fade-in w-full flex justify-center py-16">
        <svg className="animate-spin h-8 w-8 text-hutchinson-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (selectedAudit) {
    const groups = selectedAudit.details.reduce<Record<number, AuditDetailItem[]>>((acc, d) => {
      if (!acc[d.groupPosition]) acc[d.groupPosition] = [];
      acc[d.groupPosition].push(d);
      return acc;
    }, {});

    return (
      <div className="flex flex-col gap-6 animate-fade-in w-full">
        <button
          onClick={() => setSelectedAudit(null)}
          className="self-start px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          {t('back')}
        </button>

        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedAudit.auditTypeName}</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">{selectedAudit.auditTarget}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[selectedAudit.derivedStatus]}`}>
              {t(`audit_status_${selectedAudit.derivedStatus === 'InProgress' ? 'In_Progress' : selectedAudit.derivedStatus}`) || selectedAudit.derivedStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">{t('auditor')}</span>
              <p className="font-semibold text-slate-800 mt-0.5">{selectedAudit.auditorFullName}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">{t('start_date')}</span>
              <p className="font-semibold text-slate-800 mt-0.5">{formatDate(selectedAudit.startDate)}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">{t('end_date')}</span>
              <p className="font-semibold text-slate-800 mt-0.5">{formatDate(selectedAudit.endDate)}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">{t('score')}</span>
              <p className="font-semibold text-slate-800 mt-0.5">{selectedAudit.score !== null ? `${selectedAudit.score}%` : '—'}</p>
            </div>
          </div>

          {selectedAudit.comment && (
            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('comment')}</span>
              <p className="text-sm text-slate-700 mt-1">{selectedAudit.comment}</p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-5 flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('questions')}</h3>
            {Object.entries(groups).map(([pos, details]) => (
              <div key={pos} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 text-sm">{details[0].groupName}</h4>
                {details.map((d) => {
                  const answerType = getAnswerType(d);
                  return (
                    <div key={d.id} className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{d.question}</p>
                        {d.comment && <p className="text-xs text-slate-500 mt-1 italic">{d.comment}</p>}
                        {d.photoPath && (
                          <p className="text-xs text-hutchinson-blue font-medium mt-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            {t('photo_attached')}: {d.photoPath}
                          </p>
                        )}
                      </div>
                      {answerType && <AnswerBadge answer={answerType as 'OK' | 'NOK' | 'NC' | 'NA'} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title={t('no_audits')}
        description={t('no_audits_desc')}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-900">{t('tab_audit_results')}</h2>
        <p className="text-slate-500 text-xs mt-0.5">{t('audit_results_desc')}</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase select-none">
              <th className="px-6 py-4">{t('col_audit')}</th>
              <th className="px-6 py-4">{t('col_plant')}</th>
              <th className="px-6 py-4">{t('auditor')}</th>
              <th className="px-6 py-4">{t('col_date')}</th>
              <th className="px-6 py-4">{t('score')}</th>
              <th className="px-6 py-4">{t('col_status')}</th>
              <th className="px-6 py-4 text-right">{t('col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 text-sm">{a.auditTypeName}</div>
                  <div className="text-slate-400 text-xs font-medium">{a.auditTarget}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm font-medium">#{a.plantId}</td>
                <td className="px-6 py-4 text-slate-600 text-sm font-medium">{a.auditorFullName}</td>
                <td className="px-6 py-4 text-slate-600 text-sm font-medium">{formatDate(a.startDate)}</td>
                <td className="px-6 py-4 text-sm font-bold">
                  {a.score !== null ? (
                    <span className={a.score >= 70 ? 'text-emerald-600' : a.score >= 40 ? 'text-amber-600' : 'text-rose-600'}>
                      {a.score}%
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 select-none">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[a.status]}`}>
                    {t(`audit_status_${a.status === 'InProgress' ? 'In_Progress' : a.status}`) || a.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right select-none">
                  <button
                    onClick={() => openAudit(a.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-hutchinson-blue text-white rounded-lg hover:opacity-90 transition-all duration-200 cursor-pointer"
                  >
                    {t('btn_view')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditResultsPanel;
