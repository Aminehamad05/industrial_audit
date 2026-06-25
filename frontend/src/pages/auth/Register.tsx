import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api.service';
import AuthLayout from '../../components/AuthLayout';
import AuthCard from '../../components/AuthCard';
import Logo from '../../components/Logo';
import Input from '../../components/Input';
import { useLanguage } from '../../context/LanguageContext';

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: {
    _errors?: string[];
  } & Record<string, any>;
}

const ROLES = [
  { value: 'Auditor' },
  { value: 'Supervisor' },
  { value: 'MaintenanceTechnician' },
  { value: 'Administrator' },
];

const DIVISIONS = [
  { value: 'FMS', labelKey: 'division_FMS' },
  { value: 'A&D', labelKey: 'division_AD' },
];

export const Register: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Auditor');
  const [division, setDivision] = useState('FMS');
  const [loading, setLoading] = useState(false);

  // Field validation errors
  const [fullNameError, setFullNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [divisionError, setDivisionError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form validator
  const validateForm = (): boolean => {
    let isValid = true;

    // Full Name
    if (!fullName.trim()) {
      setFullNameError(t('err_fullname_required'));
      isValid = false;
    } else if (fullName.length < 2) {
      setFullNameError(t('err_fullname_min'));
      isValid = false;
    } else {
      setFullNameError('');
    }

    // Username
    if (!username.trim()) {
      setUsernameError(t('err_username_required'));
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError(t('err_username_min'));
      isValid = false;
    } else {
      setUsernameError('');
    }

    // Email
    if (!email.trim()) {
      setEmailError(t('err_email_required'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('err_email_invalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password
    if (!password) {
      setPasswordError(t('err_password_required'));
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(t('err_password_min'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Confirm Password
    if (!confirmPassword) {
      setConfirmPasswordError(t('err_confirm_password_required'));
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(t('err_confirm_password_mismatch'));
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    // Division
    if (!division) {
      setDivisionError(t('err_division_required'));
      isValid = false;
    } else {
      setDivisionError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.auth.register(username, email, password, fullName, role, division);
      const data = await response.json();

      if (!response.ok) {
        // Handle validations from backend (e.g. UsernameTakenError or Zod errors)
        const errorData = data as ApiErrorResponse;
        if (errorData.details) {
          const details = errorData.details;
          if (details.fullName?._errors?.[0]) {
            setFullNameError(t(details.fullName._errors[0]) || details.fullName._errors[0]);
          }
          if (details.username?._errors?.[0]) {
            setUsernameError(t(details.username._errors[0]) || details.username._errors[0]);
          }
          if (details.email?._errors?.[0]) {
            setEmailError(t(details.email._errors[0]) || details.email._errors[0]);
          }
          if (details.password?._errors?.[0]) {
            setPasswordError(t(details.password._errors[0]) || details.password._errors[0]);
          }
          if (details.division?._errors?.[0]) {
            setDivisionError(t(details.division._errors[0]) || details.division._errors[0]);
          }
        }
        const rawError = errorData.error || errorData.message || 'Registration failed';
        setGeneralError(t(rawError) || rawError);
        return;
      }

      setSuccessMsg(t('success_register'));
      
      // Auto redirect to login page after 1.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      console.error(err);
      setGeneralError(t('err_connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Logo centered at the top of the card */}
        <Logo className="mb-8" />

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {t('register_title')}
          </h1>
          <p className="text-[15px] text-slate-500 font-medium">
            {t('register_subtitle')}
          </p>
        </div>

        {/* Status Alerts */}
        {generalError && (
          <div className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-red-50 border border-red-100 text-sm text-hutchinson-red font-medium animate-fade-in text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-medium animate-fade-in text-left">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate>
          
          <Input
            id="fullname-field"
            label={t('fullname')}
            type="text"
            placeholder={t('fullname_placeholder')}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fullNameError) setFullNameError('');
            }}
            error={fullNameError}
            required
            disabled={loading}
            autoComplete="name"
          />

          <Input
            id="username-field"
            label={t('username')}
            type="text"
            placeholder={t('username_placeholder')}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError('');
            }}
            error={usernameError}
            required
            disabled={loading}
            autoComplete="username"
          />

          <Input
            id="email-field"
            label={t('email')}
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            error={emailError}
            required
            disabled={loading}
            autoComplete="email"
          />

          <Input
            id="password-field"
            label={t('password')}
            type="password"
            placeholder={t('password_min_placeholder')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <Input
            id="confirm-password-field"
            label={t('confirm_password')}
            type="password"
            placeholder={t('confirm_password_placeholder')}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            error={confirmPasswordError}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          {/* Role Select field */}
          <div className="flex flex-col w-full mb-5 font-sans">
            <label
              htmlFor="role-field"
              className="mb-2 text-sm font-semibold text-slate-700 text-left"
            >
              {t('role')}
              <span className="text-hutchinson-red ml-1">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="role-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="
                  w-full px-4 h-[52px] rounded-[12px] border border-slate-200 text-base text-slate-900 bg-white
                  appearance-none focus:border-hutchinson-blue focus:ring-4 focus:ring-hutchinson-blue/12
                  transition-all duration-200 ease-in-out cursor-pointer
                  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                "
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(`role_${r.value}`)}
                  </option>
                ))}
              </select>
              {/* Custom select chevron */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Division Select field */}
          <div className="flex flex-col w-full mb-8 font-sans">
            <label
              htmlFor="division-field"
              className="mb-2 text-sm font-semibold text-slate-700 text-left"
            >
              {t('division')}
              <span className="text-hutchinson-red ml-1">*</span>
            </label>
            <div className="relative w-full">
              <select
                id="division-field"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                disabled={loading}
                className="
                  w-full px-4 h-[52px] rounded-[12px] border border-slate-200 text-base text-slate-900 bg-white
                  appearance-none focus:border-hutchinson-blue focus:ring-4 focus:ring-hutchinson-blue/12
                  transition-all duration-200 ease-in-out cursor-pointer
                  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                "
              >
                {DIVISIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {t(d.labelKey)}
                  </option>
                ))}
              </select>
              {/* Custom select chevron */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {divisionError && (
              <span className="mt-1.5 text-sm text-hutchinson-red font-medium text-left leading-normal animate-fade-in">
                {divisionError}
              </span>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-[52px] bg-hutchinson-red text-white rounded-[12px] font-semibold text-base
              shadow-[0_4px_12px_rgba(227,6,19,0.15)] hover:shadow-[0_6px_20px_rgba(227,6,19,0.25)]
              hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]
              transition-all duration-[250ms] ease-out select-none
              flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
              cursor-pointer
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('creating_account')}</span>
              </>
            ) : (
              t('create_account')
            )}
          </button>
        </form>

        {/* Back to Login link */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link
            to="/login"
            className="
              inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 
              hover:text-hutchinson-blue transition-colors focus:outline-none focus:underline
            "
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_login')}</span>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
