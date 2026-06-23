import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return (
    <div 
      className="
        w-[460px] max-w-[90vw] bg-white rounded-[20px] 
        shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-10 
        transition-all duration-300 ease-in-out border border-slate-100
        animate-fade-in
      "
    >
      {children}
    </div>
  );
};

export default AuthCard;
