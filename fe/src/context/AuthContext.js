import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API, fetchMe } from '../data/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'benevola_auth';

/* The session cookie is the only real source of truth. localStorage is just a
   cache so the header doesn't flicker between anonymous and signed-in on every
   page load — it is reconciled against the server on mount. */

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** /api/auth/me answers { kind, info }; the app thinks in volunteer/organization. */
function fromMe(me) {
  if (!me?.info) return null;
  return {
    type: me.kind === 'org' ? 'organization' : 'volunteer',
    user: me.info,
  };
}

export function AuthProvider({ children }) {
  const [auth,  setAuth]  = useState(readStorage);
  /* false until the cached session has been checked against the server, so
     route guards can wait instead of bouncing a signed-in user to /login. */
  const [ready, setReady] = useState(false);

  const store = useCallback((value) => {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else       localStorage.removeItem(STORAGE_KEY);
    setAuth(value);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchMe()
      .then(me => {
        if (!alive) return;
        // A null answer means the cookie is gone or expired — drop the cache
        // rather than leaving the UI convinced it is still signed in.
        store(fromMe(me));
      })
      .catch(() => { /* API unreachable — keep the cached session as-is */ })
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [store]);

  const login = useCallback((type, userData) => {
    store({ type, user: userData });
  }, [store]);

  /** Re-read the session from the server (after a profile edit, say). */
  const refresh = useCallback(async () => {
    const me = await fetchMe();
    store(fromMe(me));
    return me;
  }, [store]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore network errors on logout */ }
    store(null);
  }, [store]);

  const isOrg       = auth?.type === 'organization';
  const isVolunteer = auth != null && !isOrg;

  return (
    <AuthContext.Provider value={{
      auth, ready, login, logout, refresh,
      isOrg, isVolunteer,
      userId: auth?.user?.id ?? null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
