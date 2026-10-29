import React from 'react';

/**
 * Official State Emblem of India (Lion Capital of Ashoka with Satyameva Jayate)
 * Renders the authentic official emblem as provided by the user.
 */
export default function EmblemLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-7 h-8',
    sm: 'w-9 h-10',
    md: 'w-11 h-12',
    lg: 'w-14 h-16',
    xl: 'w-20 h-24',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`shrink-0 overflow-hidden rounded bg-[#0b1d3a] p-1 border border-amber-400/30 shadow-sm flex items-center justify-center ${dim} ${className}`}>
      <img
        src="/emblem.jpg"
        alt="State Emblem of India"
        className="w-full h-full object-contain"
        loading="eager"
      />
    </div>
  );
}
