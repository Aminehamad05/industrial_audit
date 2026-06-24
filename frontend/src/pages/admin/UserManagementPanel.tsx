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

export default UserManagementPanel;