import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api.service';
import { StatusBadge } from '../../components/dashboard/StatusBadge';

interface UserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  accountStatus: 'Pending' | 'Active' | 'Blocked' | 'Rejected';
  createdAt: string;
}

type StatusFilter = 'All' | 'Pending' | 'Active' | 'Blocked' | 'Rejected';

export const UserManagementPanel: React.FC = () => {
  const { t } = useLanguage();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Supervisor assignment states
  const [selectedUserForSup, setSelectedUserForSup] = useState<UserListItem | null>(null);
  const [plantsList, setPlantsList] = useState<any[]>([]);
  const [supervisorsList, setSupervisorsList] = useState<any[]>([]);
  const [auditorSupervisors, setAuditorSupervisors] = useState<any[]>([]);
  const [selectedSupForPlant, setSelectedSupForPlant] = useState<Record<number, string>>({});
  const [loadingSupData, setLoadingSupData] = useState(false);
  const [supError, setSupError] = useState('');
  const [supSuccess, setSupSuccess] = useState('');

  const openSupervisorModal = async (user: UserListItem) => {
    setSelectedUserForSup(user);
    setLoadingSupData(true);
    setSupError('');
    setSupSuccess('');
    try {
      const [plantsRes, supsRes, assignmentsRes] = await Promise.all([
        api.plants.list(),
        api.auth.getSupervisors(),
        api.admin.getSupervisorsForAuditor(user.id),
      ]);

      let pList: any[] = [];
      if (plantsRes.ok) {
        const pData = await plantsRes.json();
        pList = pData.plants || [];
        setPlantsList(pList);
      }
      let sList: any[] = [];
      if (supsRes.ok) {
        const sData = await supsRes.json();
        sList = sData.supervisors || [];
        setSupervisorsList(sList);
      }
      let aList: any[] = [];
      if (assignmentsRes.ok) {
        const aData = await assignmentsRes.json();
        aList = aData || [];
        setAuditorSupervisors(aList);
      }

      // Initialize selected dropdowns
      const initialMap: Record<number, string> = {};
      pList.forEach((plant: any) => {
        const assigned = aList.find((a: any) => a.idPlant === plant.idPlant);
        initialMap[plant.idPlant] = assigned?.chef?.UserId || (sList[0]?.UserId || '');
      });
      setSelectedSupForPlant(initialMap);
    } catch (err) {
      console.error(err);
      setSupError('Failed to load supervisor data.');
    } finally {
      setLoadingSupData(false);
    }
  };

  const handleAssignSupervisor = async (plantId: number, supervisorId: string) => {
    if (!selectedUserForSup) return;
    setSupError('');
    setSupSuccess('');
    try {
      const res = await api.admin.assignSupervisorForPlant(selectedUserForSup.id, plantId, supervisorId);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to assign supervisor');
      }
      
      const assignmentsRes = await api.admin.getSupervisorsForAuditor(selectedUserForSup.id);
      if (assignmentsRes.ok) {
        const aData = await assignmentsRes.json();
        setAuditorSupervisors(aData || []);
      }
      setSupSuccess('Supervisor assigned successfully!');
      setTimeout(() => setSupSuccess(''), 2000);
    } catch (err: any) {
      console.error(err);
      setSupError(err.message || 'Failed to assign supervisor.');
    }
  };

  const handleRemoveSupervisor = async (plantId: number) => {
    if (!selectedUserForSup) return;
    setSupError('');
    setSupSuccess('');
    try {
      const res = await api.admin.removeSupervisorForPlant(selectedUserForSup.id, plantId);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to remove supervisor');
      }
      
      const assignmentsRes = await api.admin.getSupervisorsForAuditor(selectedUserForSup.id);
      if (assignmentsRes.ok) {
        const aData = await assignmentsRes.json();
        setAuditorSupervisors(aData || []);
        
        // Reset local selection for this plant
        setSelectedSupForPlant(prev => ({
          ...prev,
          [plantId]: supervisorsList[0]?.UserId || '',
        }));
      }
      setSupSuccess('Supervisor assignment cleared!');
      setTimeout(() => setSupSuccess(''), 2000);
    } catch (err: any) {
      console.error(err);
      setSupError(err.message || 'Failed to remove supervisor.');
    }
  };

  const fetchUsers = async (filter: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const apiFilter = filter === 'All' ? undefined : filter;
      const response = await api.admin.getUsers(apiFilter);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(t('err_fetch_users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(statusFilter);
  }, [statusFilter]);

  const flashSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await api.admin.approveUser(id);
      if (!response.ok) throw new Error('Approve failed');
      flashSuccess('User approved successfully!');
      fetchUsers(statusFilter);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not approve user.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.admin.rejectUser(id);
      if (!response.ok) throw new Error('Reject failed');
      flashSuccess('User rejected successfully!');
      fetchUsers(statusFilter);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not reject user.');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      const response = await api.admin.blockUser(id);
      if (!response.ok) throw new Error('Block failed');
      flashSuccess('User blocked successfully!');
      fetchUsers(statusFilter);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not block user.');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      const response = await api.admin.unblockUser(id);
      if (!response.ok) throw new Error('Unblock failed');
      flashSuccess('User unblocked successfully!');
      fetchUsers(statusFilter);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not unblock user.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('user_management')}</h2>
          <p className="text-slate-500 text-xs mt-0.5">Approve, reject or block accounts requesting access.</p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start md:self-auto select-none">
          {(['Pending', 'Active', 'Blocked', 'Rejected', 'All'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                statusFilter === filter
                  ? 'bg-white text-hutchinson-blue shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t(filter.toLowerCase())}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-hutchinson-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-medium">
          {t('no_users')}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase select-none">
                <th className="px-6 py-4">{t('col_name')}</th>
                <th className="px-6 py-4">{t('col_email')}</th>
                <th className="px-6 py-4">{t('col_role')}</th>
                <th className="px-6 py-4">{t('col_status')}</th>
                <th className="px-6 py-4 text-right">{t('col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 border-b border-slate-100 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-sm">{u.fullName}</div>
                    <div className="text-slate-400 text-xs font-medium">@{u.username}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                    {t(`role_${u.role}`) || u.role}
                  </td>
                  <td className="px-6 py-4 select-none">
                    <StatusBadge status={u.accountStatus} />
                  </td>
                  <td className="px-6 py-4 text-right select-none">
                    <div className="flex justify-end gap-1.5">
                      {u.accountStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-sm transition-all duration-200 cursor-pointer"
                          >
                            {t('btn_approve')}
                          </button>
                          <button
                            onClick={() => handleReject(u.id)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 hover:shadow-sm transition-all duration-200 cursor-pointer"
                          >
                            {t('btn_reject')}
                          </button>
                        </>
                      )}
                      {u.accountStatus === 'Active' && (
                        <button
                          onClick={() => handleBlock(u.id)}
                          className="px-2.5 py-1.5 text-xs font-bold bg-slate-700 text-white rounded-lg hover:bg-slate-800 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        >
                          {t('btn_block')}
                        </button>
                      )}
                      {u.accountStatus === 'Blocked' && (
                        <button
                          onClick={() => handleUnblock(u.id)}
                          className="px-2.5 py-1.5 text-xs font-bold bg-hutchinson-blue text-white rounded-lg hover:opacity-90 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        >
                          {t('btn_unblock')}
                        </button>
                      )}
                      {u.role.toUpperCase() === 'AUDITOR' && u.accountStatus !== 'Pending' && (
                        <button
                          onClick={() => openSupervisorModal(u)}
                          className="px-2.5 py-1.5 text-xs font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        >
                          {t('assign_supervisor')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supervisor Assignment Modal */}
      {selectedUserForSup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans select-none">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 text-left">
                  {t('manage_supervisors_title')} <span className="text-violet-600">{selectedUserForSup.fullName}</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 text-left">Assign a supervisor for each plant.</p>
              </div>
              <button
                onClick={() => setSelectedUserForSup(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-4 text-left">
              {supError && (
                <div className="bg-red-50 border border-red-100 text-hutchinson-red px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in">
                  {supError}
                </div>
              )}
              {supSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in">
                  {supSuccess}
                </div>
              )}

              {loadingSupData ? (
                <div className="py-12 flex justify-center items-center">
                  <svg className="animate-spin h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : plantsList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium">No plants found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {plantsList.map((plant) => {
                    const assignment = auditorSupervisors.find((a) => a.idPlant === plant.idPlant);
                    const hasSupervisor = assignment && assignment.chef;
                    const selectedSup = selectedSupForPlant[plant.idPlant] || '';

                    return (
                      <div
                        key={plant.idPlant}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 gap-4"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-slate-800 text-sm">
                            {plant.designationPlant || `Plant #${plant.idPlant}`}
                          </div>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5">
                            {hasSupervisor ? (
                              <span className="text-emerald-600">
                                {t('role_Supervisor')}: {assignment.chef.Name}
                              </span>
                            ) : (
                              <span className="text-amber-600">{t('no_supervisor_assigned')}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 select-none shrink-0">
                          <select
                            value={selectedSup}
                            onChange={(e) =>
                              setSelectedSupForPlant((prev) => ({
                                ...prev,
                                [plant.idPlant]: e.target.value,
                              }))
                            }
                            className="px-3 h-10 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-violet-500 cursor-pointer"
                          >
                            {supervisorsList.map((s) => (
                              <option key={s.UserId} value={s.UserId}>
                                {s.Name}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleAssignSupervisor(plant.idPlant, selectedSup)}
                            disabled={!selectedSup}
                            className="px-3 h-10 text-xs font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('btn_assign')}
                          </button>

                          {hasSupervisor && (
                            <button
                              onClick={() => handleRemoveSupervisor(plant.idPlant)}
                              className="px-3 h-10 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 cursor-pointer"
                            >
                              {t('btn_clear')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUserForSup(null)}
                className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                {t('btn_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;