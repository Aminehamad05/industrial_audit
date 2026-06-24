import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import api from '../services/api.service';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Logo from '../components/Logo';
import Input from '../components/Input';
import { useLanguage } from '../context/LanguageContext';
import { getHomeRouteForRole } from '../config/roleRoutes';
interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: {
    _errors?: string[];
  } & Record<string, any>;
}

export const Login: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Prefill email if remember me was active
  useEffect(() => {
    const savedEmail = localStorage.getItem('hutch_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Validate form fields
  const validateForm = (): boolean => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError(t('err_email_required'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email) && email !== 'admin') {
      setEmailError(t('err_email_invalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError(t('err_password_required'));
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(t('err_password_min'));
      isValid = false;
    } else {
      setPasswordError('');
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
      const response = await api.auth.login(email, password);
      const data = await response.json() as { token?: string; user?: { fullName?: string }; error?: string; message?: string };

      if (!response.ok) {
        // Handle validation errors from backend Zod schema if available
        const errorData = data as ApiErrorResponse;
        if (errorData.details) {
          const details = errorData.details;
          if (details.email?._errors?.[0]) {
            setEmailError(t(details.email._errors[0]) || details.email._errors[0]);
          }
          if (details.password?._errors?.[0]) {
            setPasswordError(t(details.password._errors[0]) || details.password._errors[0]);
          }
        }
        const rawError = errorData.error || errorData.message || 'Invalid username or password';
        setGeneralError(t(rawError) || rawError);
        return;
      }

      setSuccessMsg(t('success_login'));
      if (data.token) {
        const userObj = data.user ;
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(userObj));
          localStorage.setItem('hutch_remember_email', email);
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(userObj));
          localStorage.removeItem('hutch_remember_email');
        }
         setTimeout(() => {
           navigate(getHomeRouteForRole(userObj.role));
         }, 500);
      }

      // Direct to main dashboard or show success
     
      
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
        {/* Logo component centered at top of the card with generous bottom spacing */}
        <Logo className="mb-8" />

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {t('login_title')}
          </h1>
          <p className="text-[15px] text-slate-500 font-medium">
            {t('login_subtitle')}
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
            <Shield className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
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
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between mb-8 select-none">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="
                  w-5 h-5 rounded-[6px] border border-slate-300 text-hutchinson-blue bg-white
                  focus:ring-2 focus:ring-hutchinson-blue/20 transition-all duration-150 cursor-pointer
                  accent-hutchinson-blue
                "
              />
              <span className="text-sm font-semibold text-slate-600">{t('remember_me')}</span>
            </label>
          </div>

          {/* Login Button */}
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
                <span>{t('signing_in')}</span>
              </>
            ) : (
              t('sign_in')
            )}
          </button>
        </form>

        {/* Footer/Navigation to Register */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm font-medium text-slate-500">
            {t('need_account')}{' '}
            <Link
              to="/register"
              className="text-hutchinson-blue hover:text-hutchinson-blue/80 font-bold hover:underline transition-colors focus:outline-none focus:underline"
            >
              {t('register_here')}
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
