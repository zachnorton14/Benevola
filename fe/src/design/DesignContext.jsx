import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DESIGNS, DEFAULT_DESIGN, LOCKED, THEME_KEY } from './config';

/* Holds the two things the shell still needs to know: which design is mounted
   (one, fixed) and whether the visitor is in light or dark mode.

   The design switcher and its colour picker were removed for deployment, so
   there is no setter for either any more: the design is fixed in ./config.js
   and the brand colours live in the stylesheet, at
   variants/default/css/tokens.css. Light/dark stays a visitor preference — it
   is a product feature rather than switcher chrome, and the header toggle
   drives it. */

const DesignContext = createContext(null);

const DESIGN = LOCKED ?? DEFAULT_DESIGN;

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* private mode, SSR, whatever — fall through */ }
  return DESIGNS.find(d => d.id === DESIGN)?.theme ?? 'light';
}

export function DesignProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-design', DESIGN);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ design: DESIGN, theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside <DesignProvider>');
  return ctx;
}
