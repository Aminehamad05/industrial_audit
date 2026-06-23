
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 
        Hutchinson Logo width must be between 220px and 280px.
        Let's set it to w-[240px] (which is 240px) or w-60 (240px) to be perfectly in the middle of the range.
      */}
      <img
        src="/logo.png"
        alt="Hutchinson Logo"
        className="w-[240px] h-auto object-contain select-none"
        draggable="false"
      />
    </div>
  );
};

export default Logo;

