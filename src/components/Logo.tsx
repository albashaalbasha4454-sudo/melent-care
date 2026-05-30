import React from 'react';
// @ts-ignore
import logoImg from '../assets/images/melent_care_logo_v2_1780104866451.png';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src={logoImg} 
        alt="Melent Care Logo" 
        className="h-full w-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
