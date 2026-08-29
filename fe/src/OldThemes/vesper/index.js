/* VESPER — a civic poster printed at night. Deep petrol ground, warm bone
   type, a clay accent behaving like ink, and photography duotoned into the
   palette. Structure from rules and ground shifts, never from cards.

   The stylesheet is imported here so that deleting this folder removes the
   design completely: nothing outside src/design/registry.js knows it exists. */

import './vesper.css';

export { default as Landing }   from './pages/Landing';
export { default as Events }    from './pages/Events';
export { default as Event }     from './pages/Event';
export { default as Orgs }      from './pages/Orgs';
export { default as Org }       from './pages/Org';
export { default as Volunteer } from './pages/Volunteer';
export { default as About }     from './pages/About';
export { default as NotFound }  from './pages/NotFound';
export { Login, Signup }        from './pages/Auth';
