import React from 'react';

/**
 * Official Flag of India (Tiranga)
 * Authentic proportions (3:2) with deep Saffron (#FF671F), White with 24-spoke Ashoka Navy Blue Chakra (#000080), and India Green (#046A38).
 */
export default function IndianFlag({ className = 'w-7 h-5', style = {} }) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={`rounded-xs shadow-xs border border-slate-300/80 overflow-hidden shrink-0 select-none ${className}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="National Flag of India (Tiranga)"
      role="img"
    >
      {/* Top Stripe: India Saffron */}
      <rect width="900" height="200" fill="#FF671F" />
      {/* Middle Stripe: Pure White */}
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      {/* Bottom Stripe: India Green */}
      <rect y="400" width="900" height="200" fill="#046A38" />

      {/* Ashoka Chakra (Navy Blue 24-spoke wheel) */}
      <g transform="translate(450, 300)" stroke="#000080" fill="none">
        <circle r="76" strokeWidth="8" />
        <circle r="15" fill="#000080" />
        {/* 24 radiating spokes */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2="0"
            y2="-76"
            strokeWidth="3.2"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  );
}

