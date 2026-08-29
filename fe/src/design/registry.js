/* The one and only place that knows which files belong to which design.

   The site ships one design. The other five looks are archived under
   src/OldThemes/ rather than deleted: to bring one back, add its import and
   its BY_DESIGN entry here, and add it to DESIGNS in ./config.js. */

/* `default` is a reserved word, so the 00 variant needs an alias here even
   though its id, folder and deep link are all plain "default". */
import * as defaultDesign from '../variants/default';

import { DEFAULT_DESIGN } from './config';

/* Surfaces that are the same job in every design. Written once against the
   --ui-* bridge in src/shared/ui.css, so they adopt whichever theme is mounted
   and a new design never has to reimplement them. */
import EventNew       from '../shared/EventNewPage';

const BY_DESIGN = {
  default: defaultDesign,
};

const SHARED = { EventNew };

/** Route key -> exported component name. Every design exports all of these. */
export const SURFACES = [
  'Landing', 'Events', 'Event', 'EventNew', 'Orgs', 'Org',
  'Volunteer', 'Login', 'Signup', 'About', 'NotFound',
];

export function resolveSurface(design, surface) {
  // A design may still override a shared surface by exporting its own.
  return BY_DESIGN[design]?.[surface]
      ?? SHARED[surface]
      ?? BY_DESIGN[DEFAULT_DESIGN]?.[surface]
      ?? Object.values(BY_DESIGN).find(d => d?.[surface])?.[surface]
      ?? null;
}
