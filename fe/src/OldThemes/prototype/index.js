/* 01 PROTOTYPE — night studio. Brand-configurable: every colour descends from
   --brand-primary / --brand-secondary, which the switcher's colour picker
   writes onto :root. See src/design/brand.js.

   The stylesheet is imported here so that deleting this folder removes the
   design completely: nothing outside src/design/registry.js knows it exists.

   EventNew, ForgotPassword and ResetPassword come from src/shared: they are
   the same job in every design and adopt this theme's tokens through the
   --ui-* bridge in src/shared/ui.css. */

import './prototype.css';

export { default as Landing }   from './pages/Landing';
export { default as Events }    from './pages/Events';
export { default as Event }     from './pages/Event';
export { default as Orgs }      from './pages/Orgs';
export { default as Org }       from './pages/Org';
export { default as Volunteer } from './pages/Volunteer';
export { default as About }     from './pages/About';
export { default as NotFound }  from './pages/NotFound';
export { Login, Signup }        from './pages/Auth';
