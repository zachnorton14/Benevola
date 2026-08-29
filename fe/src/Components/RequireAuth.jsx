import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Route guard for pages that only make sense when signed in.

   This is a usability layer, not a security boundary — the API enforces
   authentication and ownership on every protected endpoint regardless of what
   the client renders. Its job is to send people to the login page instead of
   letting them reach a screen that can only fail.

   `role` narrows it further: 'organization' or 'volunteer'. */

export default function RequireAuth({ role, children }) {
  const { auth, ready, isOrg } = useAuth();
  const location = useLocation();

  /* The cached session has not been checked against the server yet. Rendering
     nothing for that moment beats bouncing a signed-in user to /login. */
  if (!ready) return null;

  if (!auth) {
    /* Remember where they were headed so login can return them there. */
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === 'organization' && !isOrg) return <Navigate to="/" replace />;
  if (role === 'volunteer'    &&  isOrg) return <Navigate to="/" replace />;

  return children;
}
