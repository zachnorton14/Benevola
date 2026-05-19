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

export const IconCalendar = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
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

export const EyeIcon = ({ show }) => show ? (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconClock = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7V12L15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconUsers = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 21C3 17.5 5.5 15 9 15C12.5 15 15 17.5 15 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 15C18.2 15 21 16.5 21 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconPin = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M12 21C12 21 5 14 5 9C5 5.7 8.1 3 12 3C15.9 3 19 5.7 19 9C19 14 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const IconEdit = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCheck = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconX = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconCheckCircle = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMail = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconPhone = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14.2 14.4C14.5 14.1 14.9 14 15.3 14.2C16.5 14.6 17.8 14.8 19 14.8C19.6 14.8 20 15.2 20 15.8V19C20 19.6 19.6 20 19 20C10.2 20 3 12.8 3 4C3 3.4 3.4 3 4 3H7.2C7.8 3 8.2 3.4 8.2 4C8.2 5.2 8.4 6.4 8.8 7.5C8.9 7.9 8.8 8.3 8.5 8.6L6.6 10.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSun = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconMoon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
