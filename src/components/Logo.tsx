import { motion } from 'motion/react';

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="melent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00234b" /> {/* Navy Blue */}
            <stop offset="33%" stopColor="#00c4cc" /> {/* Cyan */}
            <stop offset="66%" stopColor="#00d084" /> {/* Medical Green */}
            <stop offset="100%" stopColor="#84cc16" /> {/* Lime */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* The Hybrid Infinity-Heart Path */}
        <motion.path
          d="M60 70 
             C40 90, 10 70, 10 45 
             C10 20, 40 10, 60 40 
             C80 10, 110 20, 110 45 
             C110 70, 80 90, 60 70 
             Z"
          stroke="url(#melent-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* The Infinity Intersect Loop */}
        <motion.path
          d="M30 45 
             C30 30, 45 30, 60 45 
             C75 60, 90 60, 90 45 
             C90 30, 75 30, 60 45 
             C45 60, 30 60, 30 45 
             Z"
          stroke="url(#melent-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-40"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Gold Accent - Dot inside the heart-infinity joint */}
        <motion.circle
          cx="60"
          cy="42"
          r="5"
          fill="#d4af37"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 1.5, type: "spring" }}
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
};
