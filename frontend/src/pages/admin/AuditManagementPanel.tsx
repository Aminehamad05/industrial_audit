import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';

interface Plant {
  idPlant: number;
  designationPlant: string | null;
}

interface Supervisor {
  id: string;
  username: string;
  fullName: string;
}

interface Shift {
  id: number;
  shift_name: string;
}

interface Question {
  questionPosition: number;
  question: string;
  questionEng: string;
}

interface QuestionGroup {
  groupPosition: number;
  groupName: string;
  groupNameEng: string;
  questions: Question[];
}

const AUDIT_TYPES = [
  { code: 'SAFETY', name: 'Safety Inspection', nameFr: 'Inspection Sécurité' },
  { code: 'QUALITY', name: 'Quality Control', nameFr: 'Contrôle Qualité' },
  { code: 'MAINTENANCE', name: 'Preventive Maintenance', nameFr: 'Maintenance Préventive' },
  { code: 'ENVIRONMENT', name: 'Environmental Audit', nameFr: 'Audit Environnemental' },
  { code: '5S', name: '5S Audit', nameFr: 'Audit 5S' },
];

const SHIFTS_FALLBACK = ['Shift A', 'Shift B', 'Shift C'];

export const AuditManagementPanel: React.FC = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'create' | 'questions'>('create');
  const [auditId, setAuditId] = useState<number | null>(null);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [auditType, setAuditType] = useState('');
  const [auditTarget, setAuditTarget] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<number | ''>('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [startDate, setStartDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [groups, setGroups] = useState<QuestionGroup[]>([
    { groupPosition: 1, groupName: '', groupNameEng: '', questions: [{ questionPosition: 1, question: '', questionEng: '' }] },
  ]);
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    Promise.all([
      api.plants.list().then((r) => r.json()).then((d) => setPlants(d.plants || [])),
      api.auth.getSupervisors().then((r) => r.json()).then((d) => setSupervisors(d.supervisors || [])),
      api.shifts.list().then((r) => r.json()).then((d) => setShifts(d.shifts || [])),
    ]).catch(() => {});
  }, []);

  const resetForm = () => {
    setStep('create');
    setAuditId(null);
    setAuditType('');
    setAuditTarget('');
    setSelectedPlantId('');
    setSelectedSupervisorId('');
    setSelectedShift('');
    setStartDate('');
    setGroups([
      { groupPosition: 1, groupName: '', groupNameEng: '', questions: [{ questionPosition: 1, question: '', questionEng: '' }] },
    ]);
    setError('');
    setSuccess('');
  };

  const handleCreateAudit = async () => {
    setError('');
    setSuccess('');

    if (!auditType || !auditTarget || !selectedPlantId || !selectedSupervisorId || !selectedShift || !startDate) {
      setError(t('err_fill_required'));
      return;
    }

    const selectedType = AUDIT_TYPES.find((at) => at.code === auditType);

    setCreating(true);
    try {
      const res = await api.audits.create({
        auditType,
        auditTypeName: selectedType?.name || auditType,
        auditTarget,
        supervisorId: selectedSupervisorId,
        auditShiftName: selectedShift,
        plantId: Number(selectedPlantId),
        startDate: new Date(startDate).toISOString(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('err_create_audit'));
        return;
      }
      setAuditId(data.audit.id);
      setSuccess(t('audit_created'));
      setStep('questions');
    } catch {
      setError(t('err_create_audit'));
    } finally {
      setCreating(false);
    }
  };

  const addGroup = () => {
    const pos = groups.length + 1;
    setGroups([...groups, { groupPosition: pos, groupName: '', groupNameEng: '', questions: [{ questionPosition: 1, question: '', questionEng: '' }] }]);
  };

  const removeGroup = (groupIdx: number) => {
    const updated = groups.filter((_, i) => i !== groupIdx).map((g, i) => ({ ...g, groupPosition: i + 1 }));
    setGroups(updated);
  };

  const updateGroup = (groupIdx: number, field: 'groupName' | 'groupNameEng', value: string) => {
    const updated = [...groups];
    updated[groupIdx] = { ...updated[groupIdx], [field]: value };
    setGroups(updated);
  };

  const addQuestion = (groupIdx: number) => {
    const updated = [...groups];
    const pos = updated[groupIdx].questions.length + 1;
    updated[groupIdx] = {
      ...updated[groupIdx],
      questions: [...updated[groupIdx].questions, { questionPosition: pos, question: '', questionEng: '' }],
    };
    setGroups(updated);
  };

  const removeQuestion = (groupIdx: number, qIdx: number) => {
    const updated = [...groups];
    updated[groupIdx] = {
      ...updated[groupIdx],
      questions: updated[groupIdx].questions.filter((_, i) => i !== qIdx).map((q, i) => ({ ...q, questionPosition: i + 1 })),
    };
    setGroups(updated);
  };

  const updateQuestion = (groupIdx: number, qIdx: number, field: 'question' | 'questionEng', value: string) => {
    const updated = [...groups];
    updated[groupIdx].questions[qIdx] = { ...updated[groupIdx].questions[qIdx], [field]: value };
    setGroups(updated);
  };

  const moveGroup = (groupIdx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && groupIdx === 0) || (direction === 'down' && groupIdx === groups.length - 1)) return;
    const updated = [...groups];
    const swapIdx = direction === 'up' ? groupIdx - 1 : groupIdx + 1;
    [updated[groupIdx], updated[swapIdx]] = [updated[swapIdx], updated[groupIdx]];
    setGroups(updated.map((g, i) => ({ ...g, groupPosition: i + 1 })));
  };

  const moveQuestion = (groupIdx: number, qIdx: number, direction: 'up' | 'down') => {
    const updated = [...groups];
    const questions = updated[groupIdx].questions;
    if ((direction === 'up' && qIdx === 0) || (direction === 'down' && qIdx === questions.length - 1)) return;
    const swapIdx = direction === 'up' ? qIdx - 1 : qIdx + 1;
    [questions[qIdx], questions[swapIdx]] = [questions[swapIdx], questions[qIdx]];
    updated[groupIdx] = { ...updated[groupIdx], questions: questions.map((q, i) => ({ ...q, questionPosition: i + 1 })) };
    setGroups(updated);
  };

  const handleSaveQuestions = async () => {
    setError('');
    setSavingDetails(true);
    try {
      const details = groups.flatMap((g) =>
        g.questions.map((q) => ({
          groupPosition: g.groupPosition,
          groupName: g.groupName,
          groupNameEng: g.groupNameEng,
          questionPosition: q.questionPosition,
          question: q.question,
          questionEng: q.questionEng,
        }))
      );

      if (details.some((d) => !d.groupName || !d.groupNameEng || !d.question || !d.questionEng)) {
        setError(t('err_fill_questions'));
        return;
      }

      const res = await api.audits.createDetails(auditId!, details);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('err_save_questions'));
        return;
      }
      setSuccess(t('questions_saved'));
      setTimeout(resetForm, 1500);
    } catch {
      setError(t('err_save_questions'));
    } finally {
      setSavingDetails(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-bold text-slate-900">
          {step === 'create' ? t('create_audit') : t('define_questions')}
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          {step === 'create' ? t('create_audit_desc') : t('define_questions_desc')}
        </p>
        {step === 'create' && (
          <p className="text-xs text-slate-400 mt-2">{t('create_audit_supervisor_note')}</p>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {success}
        </div>
      )}

      {step === 'create' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('audit_type')}</label>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
              >
                <option value="">{t('select')}</option>
                {AUDIT_TYPES.map((at) => (
                  <option key={at.code} value={at.code}>{at.code} — {at.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('audit_target')}</label>
              <input
                type="text"
                value={auditTarget}
                onChange={(e) => setAuditTarget(e.target.value)}
                placeholder="e.g. Production Line A"
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('col_plant')}</label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value ? Number(e.target.value) : '')}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
              >
                <option value="">{t('select')}</option>
                {plants.map((p) => (
                  <option key={p.idPlant} value={p.idPlant}>
                    {p.designationPlant || `Plant ${p.idPlant}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('supervisor')}</label>
              <select
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
              >
                <option value="">{t('select')}</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} (@{s.username})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('shift')}</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
              >
                <option value="">{t('select')}</option>
                {(shifts.length > 0 ? shifts.map((s) => s.shift_name) : SHIFTS_FALLBACK).map((shift) => (
                  <option key={shift} value={shift}>{shift}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('start_date')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCreateAudit}
              disabled={creating}
              className="px-6 py-2.5 bg-hutchinson-blue text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {creating ? t('creating') : t('btn_create_audit')}
            </button>
          </div>
        </div>
      )}

      {step === 'questions' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              {t('audit_id')}: <span className="text-hutchinson-blue font-bold">#{auditId}</span>
            </p>
            <button
              onClick={addGroup}
              className="px-4 py-2 bg-hutchinson-blue text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all duration-200 cursor-pointer"
            >
              + {t('add_group')}
            </button>
          </div>

          {groups.map((group, gIdx) => (
            <div key={gIdx} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('group')} {group.groupPosition}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveGroup(gIdx, 'up')} disabled={gIdx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button onClick={() => moveGroup(gIdx, 'down')} disabled={gIdx === groups.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {groups.length > 1 && (
                    <button onClick={() => removeGroup(gIdx)} className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={group.groupName}
                  onChange={(e) => updateGroup(gIdx, 'groupName', e.target.value)}
                  placeholder={t('group_name_fr')}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
                />
                <input
                  type="text"
                  value={group.groupNameEng}
                  onChange={(e) => updateGroup(gIdx, 'groupNameEng', e.target.value)}
                  placeholder={t('group_name_en')}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
                />
              </div>

              <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-100">
                {group.questions.map((q, qIdx) => (
                  <div key={qIdx} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Q{q.questionPosition}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveQuestion(gIdx, qIdx, 'up')} disabled={qIdx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                        </button>
                        <button onClick={() => moveQuestion(gIdx, qIdx, 'down')} disabled={qIdx === group.questions.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        {group.questions.length > 1 && (
                          <button onClick={() => removeQuestion(gIdx, qIdx)} className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(gIdx, qIdx, 'question', e.target.value)}
                        placeholder={t('question_fr')}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
                      />
                      <input
                        type="text"
                        value={q.questionEng}
                        onChange={(e) => updateQuestion(gIdx, qIdx, 'questionEng', e.target.value)}
                        placeholder={t('question_en')}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-hutchinson-blue/20 focus:border-hutchinson-blue"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addQuestion(gIdx)}
                  className="self-start px-3 py-1.5 text-xs font-bold text-hutchinson-blue bg-hutchinson-blue/5 border border-hutchinson-blue/20 rounded-xl hover:bg-hutchinson-blue/10 transition-all duration-200 cursor-pointer"
                >
                  + {t('add_question')}
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveQuestions}
              disabled={savingDetails}
              className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {savingDetails ? t('saving') : t('btn_save_questions')}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all duration-200 cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditManagementPanel;
