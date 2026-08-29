# Benevola — frontend

A React app for finding local volunteering shifts. Organizations post an event
with a real date, place and capacity; volunteers sign on and both sides watch
the roster fill.

Built at NC State as a university project. **It is a demonstration, not a
running service** — every organization and event in the database is sample data
written by us, and the site says so in the footer and on each event page.

## Running it

From the repository root, `npm run dev` starts the API and this app together.
To run only the frontend:

```
cd fe
npm install
npm start
```

It expects the API at the URL in `.env.local` (`http://localhost:5173` by
default). Without it the app still renders — every page falls back to an error
or empty state rather than breaking.

| Command | Does |
|---|---|
| `npm start` | Dev server on :3000, hot reload |
| `npm test` | Jest + Testing Library, watch mode |
| `npm run build` | Production bundle into `build/` |

## How it is put together

```
src/
  App.js          routes; each names a surface, not a component
  config.js       DEMO_MODE — drives the sample-data labelling
  context/        auth, session-backed
  data/           api.js owns every endpoint; hooks.js is all the state
  design/         which design renders a surface, and the theme
  shared/         surfaces written once for every design
  variants/
    default/      the design that ships — components + css/
  OldThemes/      five shelved designs, unbundled
```

Routes name a **surface** (`Landing`, `Events`, `Event`, …) and
`design/registry.js` resolves it to a component. The site is locked to one
design, so today that indirection buys two things: the shared surfaces
(posting an event) are written once, and a shelved design can be restored
without touching the router.

**There is no fetching or state logic in any page.** `data/hooks.js` holds it
as headless hooks and `data/api.js` owns every endpoint, so a page is JSX and
CSS. That is worth preserving.

## Styling

One design ships: **Default**, in the Meadow greens. Its stylesheet is split
across `variants/default/css/`, and `default.css` is just the `@import`
manifest that fixes their order.

**To change the site's colours, edit `variants/default/css/tokens.css`.** Two
hexes at the top of that file are the only ones in the stylesheet — every
other colour, including the greys, is derived from them in CSS. One value
lives outside it: the `theme-color` meta in `public/index.html`, which tints
mobile browser chrome and cannot read a CSS variable.

Light and dark both ship, and the header toggle switches between them.

More detail in [`src/design/README.md`](./src/design/README.md).

## Animation

Everything that moves is confirming something you did — signing in, RSVPing, a
list arriving. The one exception is the causes ticker in the hero, and it is
deliberately the only ambient motion on the site.

Every animation opts out under `prefers-reduced-motion`, in the block at the
end of `css/motion.css` and one in `styles/App.css` for the route transition.
Anything new belongs there too.

## Demo-mode labelling

`config.js` exports `DEMO_MODE` and `isSample()`. Together they drive the
standing footer notice and the "Sample" tag on event pages. When real
organizations start posting alongside the seeded content, `isSample()` is the
single place to change — mark the seeded rows in the API and test for it
there. No call site needs touching.

Set `REACT_APP_DEMO_MODE=false` to turn the labelling off. CRA inlines env vars
at build time, so that is a rebuild rather than a restart.

## Tests

`src/design/surfaces.test.js` renders every surface against a stubbed API and
asserts each one mounts, fetches and settles. It is a smoke test rather than a
snapshot — cheap, and it catches a page drifting out of sync with the hooks.

```
npm test -- --watchAll=false
```

The shelved designs under `src/OldThemes/` are not compiled by anything, so a
broken import in there fails neither the build nor the tests.

## Deploying

See [`DEPLOY.md`](../DEPLOY.md) at the repository root. Short version: this
directory is its own Vercel project with Root Directory `fe`, and
`vercel.json` proxies `/api/*` to the API project so the browser stays on one
origin and the session cookie stays first-party. `REACT_APP_API_URL` must stay
unset in production for that to work.
