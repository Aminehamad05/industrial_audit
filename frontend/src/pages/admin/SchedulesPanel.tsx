import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';

interface Schedule {
  id: number;
  scheduleName: string;
  auditType: string;
  auditTarget: string | null;
  auditDate: string | null;
  auditor_login: string | null;
  auditTargetSubarea: string | null;
  auditTargetArea: string | null;
  plantId: number | null;
  status: number | null;
  section: string | null;
  plant?: {
    idPlant: number;
    designationPlant: string | null;
  };
}

interface Plant {
  idPlant: number;
  designationPlant: string | null;
}

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export const SchedulesPanel: React.FC = () => {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [auditors, setAuditors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [auditType, setAuditType] = useState('SAFETY');
  const [auditTarget, setAuditTarget] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [auditorLogin, setAuditorLogin] = useState('');
  const [plantId, setPlantId] = useState<number | ''>('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState<number>(1);
  const [formError, setFormError] = useState('');

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await api.schedules.list();
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // Load plants and auditors
    Promise.all([
      api.plants.list().then((r) => r.json()),
      api.admin.getUsers().then((r) => r.json()),
    ])
      .then(([plantsData, usersData]) => {
        setPlants(plantsData.plants || []);
        const allUsers: User[] = usersData.users || [];
        const auditorUsers = allUsers.filter((u) => u.role === 'Auditor');
        setAuditors(auditorUsers);
        if (auditorUsers.length > 0) {
          setAuditorLogin(auditorUsers[0].username);
        }
        if (plantsData.plants?.length > 0) {
          setPlantId(plantsData.plants[0].idPlant);
        }
      })
      .catch((err) => {
        console.error('Error loading metadata:', err);
      });
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setScheduleName('');
    setAuditType('SAFETY');
    setAuditTarget('');
    setAuditDate('');
    if (auditors.length > 0) setAuditorLogin(auditors[0].username);
    if (plants.length > 0) setPlantId(plants[0].idPlant);
    setSection('');
    setStatus(1);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (s: Schedule) => {
    setEditingId(s.id);
    setScheduleName(s.scheduleName);
    setAuditType(s.auditType);
    setAuditTarget(s.auditTarget || '');
    setAuditDate(s.auditDate ? s.auditDate.substring(0, 10) : '');
    setAuditorLogin(s.auditor_login || (auditors[0]?.username || ''));
    setPlantId(s.plantId || (plants[0]?.idPlant || ''));
    setSection(s.section || '');
    setStatus(s.status || 1);
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirm_delete') || 'Are you sure you want to delete this schedule?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.schedules.delete(id);
      if (res.ok) {
        setSuccessMsg(t('success_delete_schedule') || 'Schedule deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchSchedules();
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete schedule.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!scheduleName.trim()) {
      setFormError('Schedule name is required');
      return;
    }
    if (!auditType.trim()) {
      setFormError('Audit type is required');
      return;
    }
    if (!plantId) {
      setFormError('Plant is required');
      return;
    }

    const payload = {
      scheduleName,
      auditType,
      auditTarget: auditTarget || null,
      auditDate: auditDate || null,
      plantId: Number(plantId),
      auditor_login: auditorLogin || null,
      section: section || null,
      status,
    };

    setLoading(true);
    try {
      let res;
      if (editingId) {
        res = await api.schedules.update(editingId, payload);
      } else {
        res = await api.schedules.create(payload);
      }

      if (res.ok) {
        setSuccessMsg(
          editingId
            ? t('success_update_schedule') || 'Schedule updated successfully!'
            : t('success_create_schedule') || 'Schedule created successfully!'
        );
        setTimeout(() => setSuccessMsg(''), 3000);
        setShowModal(false);
        fetchSchedules();
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to save schedule.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 text-left">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('tab_schedules') || 'Schedules'}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{t('schedules_desc') || 'Plan and schedule industrial audits for plants and auditors.'}</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-bold bg-hutchinson-red text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer self-start md:self-auto"
        >
          + {t('btn_create_schedule') || 'New Schedule'}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium animate-fade-in text-left">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in text-left">
          {successMsg}
        </div>
      )}

      {loading && schedules.length === 0 ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-hutchinson-red" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-medium">
          {t('no_schedules') || 'No schedules planned.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 text-left select-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Plant</th>
                <th className="px-6 py-4">Auditor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{s.scheduleName}</div>
                    <div className="text-slate-400 text-xs font-semibold">{s.auditTarget || ''} {s.section ? `(${s.section})` : ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200/50 text-blue-700">
                      {s.auditType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-semibold">
                    {s.plant?.designationPlant || `Plant #${s.plantId}`}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                    @{s.auditor_login || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                    {s.auditDate ? new Date(s.auditDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(s)}
                        className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
                      >
                        {t('btn_edit') || 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:text-rose-700 cursor-pointer transition-colors"
                      >
                        {t('btn_delete') || 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Edit Schedule' : 'Create Schedule'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in">
                  {formError}
                </div>
              )}

              <div className="flex flex-col w-full">
                <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Schedule Name <span className="text-hutchinson-red">*</span>
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="e.g. Q3 Plant Safety Assessment"
                  className="px-4 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Audit Type <span className="text-hutchinson-red">*</span>
                  </label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                    className="px-3 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red bg-white cursor-pointer"
                  >
                    <option value="SAFETY">SAFETY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="QUALITY">QUALITY</option>
                    <option value="5S">5S</option>
                  </select>
                </div>

                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Audit Date
                  </label>
                  <input
                    type="date"
                    value={auditDate}
                    onChange={(e) => setAuditDate(e.target.value)}
                    className="px-4 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Plant <span className="text-hutchinson-red">*</span>
                  </label>
                  <select
                    value={plantId}
                    onChange={(e) => setPlantId(Number(e.target.value))}
                    className="px-3 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red bg-white cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select Plant</option>
                    {plants.map((p) => (
                      <option key={p.idPlant} value={p.idPlant}>
                        {p.designationPlant}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Auditor
                  </label>
                  <select
                    value={auditorLogin}
                    onChange={(e) => setAuditorLogin(e.target.value)}
                    className="px-3 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red bg-white cursor-pointer"
                  >
                    <option value="">Select Auditor</option>
                    {auditors.map((a) => (
                      <option key={a.id} value={a.username}>
                        {a.fullName} (@{a.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Audit Target
                  </label>
                  <input
                    type="text"
                    value={auditTarget}
                    onChange={(e) => setAuditTarget(e.target.value)}
                    placeholder="e.g. Line A"
                    className="px-4 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. Stamping"
                    className="px-4 h-11 rounded-lg border border-slate-200 focus:border-hutchinson-red"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 mt-4 select-none">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-bold bg-hutchinson-red text-white hover:opacity-90 rounded-lg cursor-pointer shadow-sm transition-opacity"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
