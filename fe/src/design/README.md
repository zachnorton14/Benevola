# Design

The site ships one look: **Default** — open daylight, a diagonal brand wash
behind the hero, soft cards, pill buttons — in the **Meadow** greens.

Routes name a *surface* (`Landing`, `Events`, `Event`, …) and the registry
resolves it to a component. That indirection is still here because it is what
lets a shared surface (posting an event) be written once, and because it is how
a shelved design gets restored without touching the router.

Five other designs were built for this project and are archived, unbundled,
under [`src/OldThemes/`](../OldThemes/README.md).

## What is fixed, and where

| Thing | Fixed in | Visitor can change it? |
|---|---|---|
| Design | `LOCKED` in [`config.js`](./config.js) | No |
| Brand colour | `:root` in [`css/tokens.css`](../variants/default/css/tokens.css) | No |
| Light / dark | — | Yes, header toggle, persisted under `theme` |

The design switcher and its colour picker were deleted. With them went the
`?design=`, `?brand=`, `?primary=` URL overrides and the `benevola_design` /
`benevola_brand` storage reads — on a locked site those were a way for any
visitor to repaint the brand from a link.

[`public/index.html`](../../public/index.html) stamps `data-design` and
`data-theme` before React boots so the first frame is not painted in the wrong
mode. It deliberately does **not** set the colours — those come from the
stylesheet, which is render-blocking and so lands before the first paint
anyway.

## Brand colour

Default builds its entire palette, neutrals included, out of two variables:

```
--brand-primary     #157C4F   buttons, links, focus rings, active nav, meter fill
--brand-secondary   #A3CF64   gradient second stop, section accents, glows
```

Everything else — hover states, soft tints, borders, and even the greys — is
derived from those two in CSS with relative colour syntax, so changing them
moves the whole theme. They are the only hexes in the stylesheet, and
`tokens.css` lists the four other palettes drawn for this project if you want
to swap. No JavaScript is involved.

### Two rules when touching the palette

1. **Fills and text are different tokens.** A brand colour is only safe under
   its own `--brand-*-ink`. As *text* on the page ground it can fall to 3.6:1,
   so links and icons use a pinned-lightness variant (`--def-pri-text`)
   instead. If you change a hue, re-check the ink by eye — nothing computes it
   for you any more.
2. **No `calc()` with relative-colour channel keywords.** CRA's CSS minifier
   cannot parse `calc(l - 0.07)` and fails the production build. Use a literal
   lightness (`oklch(from var(--brand-primary) 0.48 c h)`) or `color-mix()`.

## Where the CSS lives

`variants/default/default.css` is now a manifest of `@import`s and nothing
else. The real rules sit in `variants/default/css/`, each file a contiguous
slice of what used to be one 1,200-line stylesheet:

| File | Holds |
|---|---|
| `tokens.css` | the brand colours, every design token, dark mode |
| `shell.css` | page frame, nav, typography |
| `controls.css` | buttons, panels, fields, chips |
| `landing.css` | the landing page only |
| `listings.css` | event and organization rows |
| `detail.css` | detail layouts, roster, profile header |
| `team.css` | the About page team grid |
| `states.css` | edit bar, empty and error states |
| `footer.css` | footer, and the demo notice it carries |
| `motion.css` | every animation, and the reduced-motion block |

**Import order in `default.css` is the cascade.** Tokens first because
everything reads from them; motion last because its `prefers-reduced-motion`
block switches off animations the earlier files declare. Adding a file means
adding an `@import` in the right place, not just creating it.

## Bringing back a shelved design

See [`src/OldThemes/README.md`](../OldThemes/README.md). Three steps: move the
folder back to `src/variants/`, add it to `registry.js`, add it to `DESIGNS` in
`config.js`. To let visitors choose between designs again you also need to set
`LOCKED` back to `null` and recover `DesignSwitcher.jsx` and `switcher.css`
from git history.

## Adding a design

Create `src/variants/<name>/index.js` exporting every surface by name
(`Landing`, `Events`, `Event`, `Orgs`, `Org`, `Volunteer`, `Login`, `Signup`,
`About`, `NotFound`), import its stylesheet there, then add it to `DESIGNS` and
`registry.js`.

Add a `[data-design='<name>']` block to [`../shared/ui.css`](../shared/ui.css)
mapping your tokens onto the `--ui-*` bridge, or the shared surface will render
in the fallback palette.

You should not need to write any fetching or state logic: everything lives in
[`src/data/hooks.js`](../data/hooks.js) as headless hooks, and
[`src/data/api.js`](../data/api.js) owns every endpoint. A new design is JSX
and CSS only.

## Tests

[`surfaces.test.js`](./surfaces.test.js) renders every surface in every
*registered* design against a stubbed API and asserts each one mounts and
settles. It picks up new designs automatically — and, since the archive is not
registered, it no longer covers those.

```
npm test -- --testPathPattern=surfaces
```

The archived designs under `src/OldThemes/` are not compiled by anything, so a
broken import in there will not fail the build or the tests. Restore a design
before trusting an edit to it.
