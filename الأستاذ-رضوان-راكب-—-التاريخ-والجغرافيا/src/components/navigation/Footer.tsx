import React from 'react';

/**
 * Luxury Overlapping Wave Footer in Deep Navy (#101D2D) and Antique Gold (#B99B68)
 * Strictly reproduces the sweeping multi-layered waves at the bottom of the reference image
 * without traditional footer links or text clutter.
 */
export function Footer() {
  return (
    <footer
      aria-hidden="true"
      data-testid="luxury-wave-footer"
      className="relative w-full overflow-hidden select-none pointer-events-none mt-auto pt-4"
    >
      <svg
        viewBox="0 0 1440 165"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-[108px] sm:h-[130px] block"
      >
        <defs>
          <linearGradient id="goldWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A68652" stopOpacity="0.92" />
            <stop offset="32%" stopColor="#D6BB84" stopOpacity="0.95" />
            <stop offset="68%" stopColor="#B99B68" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C8AA74" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="navyUpperWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15253A" />
            <stop offset="50%" stopColor="#101D2D" />
            <stop offset="100%" stopColor="#0C1724" />
          </linearGradient>
          <linearGradient id="navyDeepWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B1420" />
            <stop offset="50%" stopColor="#101D2D" />
            <stop offset="100%" stopColor="#0A121D" />
          </linearGradient>
        </defs>

        {/* Soft Antique Gold Sweeping Crest on the Right & Left */}
        <path
          d="M0,42 C240,108 520,132 840,78 C1110,32 1300,2 1440,26 L1440,165 L0,165 Z"
          fill="url(#goldWaveGrad)"
        />

        {/* Primary Deep Navy Wave Sweeping Across */}
        <path
          d="M0,56 C260,118 540,134 860,86 C1130,45 1310,20 1440,44 L1440,165 L0,165 Z"
          fill="url(#navyUpperWaveGrad)"
        />

        {/* Fine Intersecting Antique Gold Hairline Ribbon */}
        <path
          d="M0,78 C310,124 660,122 980,74 C1200,41 1345,44 1440,66"
          stroke="#C7A972"
          strokeWidth="2.2"
          strokeOpacity="0.78"
          fill="none"
        />

        {/* Secondary Lower Deep Navy Wave Layer */}
        <path
          d="M0,82 C310,128 660,126 980,78 C1200,45 1345,48 1440,70 L1440,165 L0,165 Z"
          fill="url(#navyDeepWaveGrad)"
        />

        {/* Subtle Inner Gold Accent Line near Bottom Left */}
        <path
          d="M0,106 C240,138 520,148 860,128 C1140,112 1320,96 1440,104"
          stroke="#B99B68"
          strokeWidth="1.2"
          strokeOpacity="0.45"
          fill="none"
        />
      </svg>
    </footer>
  );
}
