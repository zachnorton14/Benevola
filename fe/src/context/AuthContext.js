import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function readStorage() {
  try {
    const raw = localStorage.getItem('benevola_auth');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStorage);

  const login = (type, userData) => {
    const value = { type, user: userData };
    localStorage.setItem('benevola_auth', JSON.stringify(value));
    setAuth(value);
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, { method: 'POST' });
    } catch { /* ignore network errors on logout */ }
    localStorage.removeItem('benevola_auth');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
