/* Site-wide mode flags.

   DEMO_MODE says this deployment is a demonstration rather than a live
   service: everything in the database came from the seeders in api/seeders/,
   and no real organization has posted anything. It drives the footer notice
   and the "Sample" tag on every listing.

   Turn it off by setting REACT_APP_DEMO_MODE=false in the environment — note
   that CRA inlines env vars at build time, so that means a rebuild, not a
   restart. */
export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE !== 'false';

/* Whether one record should be labelled as sample data.

   Right now the whole deployment is seeded, so this is the mode flag and
   nothing else. When real organizations start posting alongside the demo
   content, this is the single place to change: give the seeded rows a marker
   the API returns, and test that here instead. Every caller already asks the
   question through this function. */
export function isSample() {
  return DEMO_MODE;
}
