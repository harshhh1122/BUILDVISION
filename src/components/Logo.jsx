import React from 'react';

// Icon-only version of the BuildVision AI logo (highly scalable SVG)
export function LogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. Blue Scanning Brackets */}
      {/* Top Left */}
      <path d="M15 30V15H30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Top Right */}
      <path d="M85 30V15H70" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Left */}
      <path d="M15 70V85H30" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Right */}
      <path d="M85 70V85H70" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* 2. Orange/Yellow Circuit Lines & Nodes */}
      {/* Left Node */}
      <line x1="22" y1="65" x2="33" y2="59" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="21" cy="65" r="4.5" fill="#f59e0b" />

      {/* Top Right Node */}
      <line x1="67" y1="52" x2="78" y2="47" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="79" cy="46" r="4.5" fill="#f59e0b" />

      {/* Bottom Right Node */}
      <line x1="67" y1="73" x2="78" y2="76" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="79" cy="77" r="4.5" fill="#f59e0b" />

      {/* 3. Blue House Structure */}
      {/* House Body (Polygon combining roof and base) */}
      <path 
        d="M32 79.5V47.5L50 32L68 47.5V79.5H32Z" 
        fill="#2563eb" 
        stroke="#1d4ed8"
        strokeWidth="1.5"
      />
      {/* Thicker foundation slab */}
      <rect x="29" y="79" width="42" height="3" rx="1.5" fill="#1d4ed8" />

      {/* 4. White Door & Window cutouts */}
      {/* Door */}
      <rect x="38" y="58" width="10" height="21" fill="white" rx="0.5" />
      {/* Window */}
      <rect x="56" y="58" width="8" height="8" fill="white" rx="0.5" />
    </svg>
  );
}

// Full version of the BuildVision AI logo (with typography and slogan)
export function LogoFull({ className = "w-40 h-auto" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <LogoIcon className="w-16 h-16" />
      <div className="text-center select-none mt-1">
        <h2 className="text-lg font-bold tracking-wide text-slate-100 flex items-center justify-center gap-1.5 font-sans">
          BuildVision <span className="text-indigo-400 font-extrabold">AI</span>
        </h2>
        <span className="text-[8px] uppercase tracking-widest text-gray-500 font-semibold font-mono block mt-0.5">
          See it before you build it
        </span>
      </div>
    </div>
  );
}
