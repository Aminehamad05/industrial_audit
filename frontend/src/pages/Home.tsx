import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import api from '../services/api.service';

interface HomeProps {
  fullName: string;
  role: string;
}

interface UserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  accountStatus: 'Pending' | 'Active' | 'Blocked' | 'Rejected';
  createdAt: string;
}

export const Home: React.FC<HomeProps> = ({ fullName, role }) => {
  const { t,language } = useLanguage();
  const navigate = useNavigate();
  const isAdmin = role === 'Administrator';
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'audit_results'>('dashboard');

  // Users list state
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Active' | 'Blocked' | 'Rejected'>('All');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch users function
  const fetchUsers = async (filter: string) => {
    if (!isAdmin) return;
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
    if (activeTab === 'users') {
      fetchUsers(statusFilter);
    }
  }, [statusFilter, role, activeTab]);

  // Actions
  const handleApprove = async (id: string) => {
    try {
      const response = await api.admin.approveUser(id);
      if (!response.ok) throw new Error('Approve failed');
      setActionSuccess('User approved successfully!');
      fetchUsers(statusFilter);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not approve user.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.admin.rejectUser(id);
      if (!response.ok) throw new Error('Reject failed');
      setActionSuccess('User rejected successfully!');
      fetchUsers(statusFilter);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not reject user.');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      const response = await api.admin.blockUser(id);
      if (!response.ok) throw new Error('Block failed');
      setActionSuccess('User blocked successfully!');
      fetchUsers(statusFilter);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not block user.');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      const response = await api.admin.unblockUser(id);
      if (!response.ok) throw new Error('Unblock failed');
      setActionSuccess('User unblocked successfully!');
      fetchUsers(statusFilter);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not unblock user.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = language === 'fr' 
      ? 'Voulez-vous vraiment supprimer cet utilisateur ?' 
      : 'Are you sure you want to delete this user?';
      
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const response = await api.admin.deleteUser(id);
      if (!response.ok) throw new Error('Delete failed');
      setActionSuccess(language === 'fr' ? 'Utilisateur supprimé avec succès !' : 'User deleted successfully!');
      fetchUsers(statusFilter);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'fr' ? 'Impossible de supprimer cet utilisateur.' : 'Could not delete user.');
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col w-full text-left">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm w-full select-none">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Hutchinson Logo" 
            className="h-8 w-auto object-contain select-none cursor-pointer" 
            onClick={() => setActiveTab('dashboard')} 
          />
          <span className="h-5 w-[1px] bg-slate-200" />
          
          {/* Profile details & icon in left of the navbar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hutchinson-blue text-white font-bold flex items-center justify-center text-sm shadow-sm select-none">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs font-semibold text-slate-600 max-w-[120px] truncate">
              {fullName}
            </div>
          </div>
        </div>

        {/* Navbar buttons in the right */}
        <div className="flex items-center gap-2">
          {/* Dashboard Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tab_dashboard')}
          </button>

          {/* Audit Results (no page) */}
          <button
            onClick={() => setActiveTab('audit_results')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'audit_results'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tab_audit_results')}
          </button>

          {/* User Management (Only visible to Administrators) */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('tab_user_management')}
            </button>
          )}

          <span className="h-5 w-[1px] bg-slate-200 mx-2" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/75 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow flex flex-col gap-8">
        
        {/* VIEW 1: Dashboard Home */}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8 animate-fade-in w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {t('welcome')}, {fullName}!
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {t('logged_in_as')}: <span className="text-hutchinson-blue font-bold">{t(`role_${role}`) || role}</span>
            </p>
          </div>
        )}

        {/* VIEW 2: Audit Results Placeholder */}
        {activeTab === 'audit_results' && (
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-8 animate-fade-in w-full text-center py-16">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 select-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{t('coming_soon')}</h2>
              <p className="text-slate-500 font-medium text-sm">
                {t('coming_soon_desc')}
              </p>
            </div>
          </div>
        )}

        {/* VIEW 3: Admin User Management */}
        {activeTab === 'users' && isAdmin && (
          <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 md:p-8 animate-fade-in w-full flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('user_management')}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Approve, reject or block accounts requesting access.</p>
              </div>
              
              {/* Tab Filters */}
              <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start md:self-auto select-none">
                {(['All', 'Pending', 'Active', 'Blocked', 'Rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
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

            {/* Error & Success Messages */}
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

            {/* Users Table */}
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
                          <span
                            className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                              ${u.accountStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : ''}
                              ${u.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : ''}
                              ${u.accountStatus === 'Blocked' ? 'bg-slate-100 text-slate-700 border-slate-200/50' : ''}
                              ${u.accountStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' : ''}
                            `}
                          >
                            {t(`status_${u.accountStatus}`) || u.accountStatus}
                          </span>
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
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="px-2.5 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            >
                              {t('btn_delete')}
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
        )}
      </main>

      {/* Floating Language Toggle in the bottom right outside of navbar */}
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageToggle />
      </div>
    </div>
  );
};

export default Home;