import React from 'react';
import LanguageToggle from './LanguageToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-white overflow-hidden select-none">
      
      {/* Language Toggle in bottom-right outside of the card */}
      <div className="fixed bottom-6 right-6 z-20">
        <LanguageToggle />
      </div>
      
      {/* 
        Subtle geometric industrial-inspired shapes and grid patterns in the background.
        Uses extremely light blue and gray tones (slate-200/slate-300 and blue-100) with low opacity.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* Full-screen SVG grid pattern */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.75" strokeOpacity="0.4" />
            </pattern>
            <pattern id="subgrid" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="none" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeOpacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#subgrid)" />
        </svg>

        {/* Industrial Geometric Abstract Shapes (Minimalist blueprint/technical lines) */}
        <svg className="absolute w-full h-full inset-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
          {/* Top Left: Tech blueprint circle & coordinates */}
          <circle cx="100" cy="100" r="150" fill="none" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" strokeDasharray="5,5" />
          <circle cx="100" cy="100" r="100" fill="none" stroke="#0B1975" strokeWidth="1.5" strokeOpacity="0.04" />
          <line x1="100" y1="0" x2="100" y2="280" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" strokeDasharray="3,3" />
          <line x1="0" y1="100" x2="280" y2="100" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" strokeDasharray="3,3" />
          <text x="110" y="90" fill="#0B1975" fillOpacity="0.15" fontSize="10" fontFamily="monospace">SYS.LOC: HUTCH-FR//09</text>

          {/* Top Right: Angular lines */}
          <path d="M1200,0 L1440,240 M1280,0 L1440,160 M1120,0 L1440,320" stroke="#0B1975" strokeWidth="0.75" strokeOpacity="0.04" />
          <rect x="1350" y="30" width="60" height="60" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeOpacity="0.3" />
          
          {/* Bottom Left: Mechanical gear outline or grid coordinates */}
          <line x1="0" y1="780" x2="350" y2="780" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" />
          <line x1="200" y1="650" x2="200" y2="900" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" />
          <circle cx="200" cy="780" r="8" fill="none" stroke="#E30613" strokeWidth="2" strokeOpacity="0.08" />
          <circle cx="200" cy="780" r="40" fill="none" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.04" />
          <rect x="50" y="800" width="100" height="8" fill="none" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" />

          {/* Bottom Right: Blueprint schematic lines */}
          <path d="M1050,900 L1440,510" stroke="#0B1975" strokeWidth="1.5" strokeOpacity="0.03" />
          <circle cx="1200" cy="750" r="180" fill="none" stroke="#0B1975" strokeWidth="1.5" strokeOpacity="0.02" />
          <circle cx="1200" cy="750" r="140" fill="none" stroke="#0B1975" strokeWidth="1" strokeOpacity="0.03" strokeDasharray="10,10" />
          <line x1="1200" y1="500" x2="1200" y2="900" stroke="#0B1975" strokeWidth="0.75" strokeOpacity="0.03" />
          <line x1="950" y1="750" x2="1440" y2="750" stroke="#0B1975" strokeWidth="0.75" strokeOpacity="0.03" />
          <text x="1210" y="740" fill="#0B1975" fillOpacity="0.15" fontSize="10" fontFamily="monospace">SCALE: 1:0.045</text>
        </svg>
      </div>

      {/* Main Form Content Card Container */}
      <main className="relative z-10 w-full flex items-center justify-center p-4">
        {children}
      </main>

    </div>
  );
};

export default AuthLayout;
