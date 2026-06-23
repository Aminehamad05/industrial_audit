import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    // Toggle password visibility
    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    // Determine input type
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col w-full mb-5 font-sans">
        {/* Label */}
        <label
          htmlFor={id}
          className="mb-2 text-sm font-semibold text-slate-700 text-left"
        >
          {label}
          {props.required && <span className="text-hutchinson-red ml-1">*</span>}
        </label>

        {/* Input Wrapper */}
        <div className="relative w-full">
          <input
            id={id}
            type={inputType}
            ref={ref}
            className={`
              w-full px-4 h-[52px] rounded-[12px] border text-base text-slate-900 bg-white
              placeholder:text-slate-400 transition-all duration-200 ease-in-out
              ${error 
                ? 'border-hutchinson-red focus:border-hutchinson-red focus:ring-4 focus:ring-hutchinson-red/12' 
                : 'border-slate-200 focus:border-hutchinson-blue focus:ring-4 focus:ring-hutchinson-blue/12'
              }
              ${props.disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
              ${isPassword ? 'pr-12' : ''}
              ${className}
            `}
            {...props}
          />

          {/* Show/Hide Password Button */}
          {isPassword && !props.disabled && (
            <button
              type="button"
              onClick={handleTogglePassword}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <span className="mt-1.5 text-sm text-hutchinson-red font-medium text-left leading-normal animate-fade-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
