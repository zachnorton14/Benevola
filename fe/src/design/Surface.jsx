import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDesign } from './DesignContext';
import { resolveSurface } from './registry';

/** Renders `name` in whichever design is currently active. */
export default function Surface({ name }) {
  const { design } = useDesign();
  const { pathname } = useLocation();
  const Component  = resolveSurface(design, name);

  if (!Component) {
    return (
      <div style={{ padding: '4rem 1.5rem', fontFamily: 'ui-monospace, monospace' }}>
        No component registered for surface “{name}”.
      </div>
    );
  }

  /* Keyed on the path so the fade replays on every navigation, including
     between two routes that render the same surface (one event to the next).
     Short by design: long enough to soften the swap, not long enough to make
     the site feel slower than it is. */
  return (
    <div className="route-fade" key={pathname}>
      <Component />
    </div>
  );
}
