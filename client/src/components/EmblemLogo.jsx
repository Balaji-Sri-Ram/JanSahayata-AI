import React from 'react';

/**
 * Official State Emblem of India (Lion Capital of Ashoka with Satyameva Jayate)
 * Features bright, crisp authentic lion details with a subtle regal gold-shimmer animation.
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
    <div 
      className={`shrink-0 flex items-center justify-center transition-all duration-300 bg-transparent ${dim} ${className}`}
      title="State Emblem of India • Government of India"
    >
      <img
        src="/emblem.jpg"
        alt="State Emblem of India (Three Lions Capital)"
        className="w-full h-full object-contain emblem-image-enhanced select-none"
        loading="eager"
      />
    </div>
  );
}
