import React from 'react';

export const LeafLogo = ({ size = 36, gradId = 'leaf-grad' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M30 4C30 4 24 4 17 7C10 10 6 16 6 22C6 28 10 32 16 32C22 32 28 27 30 19C31.5 12 30 4 30 4Z"
      fill={`url(#${gradId})`}
    />
    <path
      d="M9 30C9 30 14 22 20 18C26 14 28 12 28 12"
      stroke="#1f4f3a" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55"
    />
    <defs>
      <linearGradient id={gradId} x1="6" y1="32" x2="30" y2="4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2d6a4f" />
        <stop offset="1" stopColor="#7cc05a" />
      </linearGradient>
    </defs>
  </svg>
);

export const CaretIcon = ({ open }) => (
  <svg className={'caret' + (open ? ' open' : '')} viewBox="0 0 10 10" fill="none">
    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRight = () => (
  <svg className="arrow" viewBox="0 0 14 14" fill="none">
    <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 10H20M8 3V6M16 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconHands = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <path
      d="M7 13V8C7 7 8 6 9 7V10M11 13V6C11 5 12 4 13 5V11M15 13V8C15 7 16 6 17 7V14C17 18 14 21 11 21C8 21 5 18 5 14V12C5 11 6 10 7 11"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export const IconBuilding = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <path
      d="M4 20V6L12 3V20M12 20V9L20 7V20M4 20H20M7 9H9M7 13H9M7 17H9M15 12H17M15 16H17"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export const IconCompass = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15 9L13 13L9 15L11 11L15 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const IconUser = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
