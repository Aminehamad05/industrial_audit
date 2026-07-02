import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';

interface UnassignedAudit {
  id: number;
  auditTypeName: string | null;
  auditTarget: string | null;
  auditShiftName: string | null;
  startDate: string | null;
  plantId: number | null;
}

interface TeamAuditor {
  id: string;
  username: string | null;
  fullName: string | null;
  plantId: number | null;
  plantName: string | null;
}

export const SupervisorAssignPanel: React.FC<{ onAssigned: () => void }> = ({ onAssigned }) => {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<UnassignedAudit[]>([]);
  const [auditors, setAuditors] = useState<TeamAuditor[]>([]);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [auditsRes, teamRes] = await Promise.all([
        api.audits.list({ unassignedOnly: true }),
        api.supervisor.getAuditors(),
      ]);
      if (!auditsRes.ok || !teamRes.ok) throw new Error();
      const auditsData = await auditsRes.json();
      const teamData = await teamRes.json();
      setAudits(auditsData.audits || []);
      setAuditors(teamData.auditors || []);
    } catch {
      setError(t('err_fetch_audits'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (auditId: number) => {
    const auditorId = assignments[auditId];
    if (!auditorId) return;

    setSubmittingId(auditId);
    setError('');
    setSuccess('');
    try {
      const res = await api.audits.reassign(auditId, auditorId);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('err_assign_auditor'));
      }
      setSuccess(t('success_assign_auditor'));
      await loadData();
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('err_assign_auditor'));
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-400">
        {t('loading')}...
      </div>
    );
  }

  if (audits.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t('assign_audits_title')}</h2>
        <p className="text-slate-500 text-xs mt-0.5">{t('assign_audits_desc')}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {audits.map((audit) => {
          const plantAuditors = auditors.filter((a) => !audit.plantId || a.plantId === audit.plantId);
          return (
            <div key={audit.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">
                  {audit.auditTypeName || 'Audit'} — {audit.auditTarget || 'N/A'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {audit.startDate ? new Date(audit.startDate).toLocaleDateString() : 'N/A'}
                  {audit.auditShiftName ? ` · ${audit.auditShiftName}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={assignments[audit.id] || ''}
                  onChange={(e) => setAssignments((prev) => ({ ...prev, [audit.id]: e.target.value }))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg min-w-[180px]"
                >
                  <option value="">{t('select_auditor')}</option>
                  {plantAuditors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} (@{a.username})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(audit.id)}
                  disabled={!assignments[audit.id] || submittingId === audit.id}
                  className="px-4 py-2 text-xs font-bold bg-hutchinson-blue text-white rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {submittingId === audit.id ? t('assigning') : t('btn_assign')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupervisorAssignPanel;
