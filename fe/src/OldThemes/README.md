# OldThemes

The five designs the site no longer ships, kept rather than deleted.

Nothing in here is imported by the running app, so none of it reaches the
bundle — webpack only follows what `src/design/registry.js` imports, and that
now names one design. These files are archived source, not dead weight in the
build.

| id | name | look |
|---|---|---|
| `prototype` | Prototype | night studio: near-black ground, heavy display type, colour in whole blocks |
| `vesper` | Vesper | civic poster printed at night: deep petrol ground, Fraunces display serif, clay accent |
| `classic` | Classic | the original green-and-white build |
| `atlas` | Atlas | working surface: indigo, lists rather than card grids, daylight |
| `dispatch` | Dispatch | public notice: paper, heavy ink, vermilion |

## Layout

`prototype`, `vesper`, `atlas` and `dispatch` are self-contained folders that
were moved here verbatim. `OldThemes/` sits at the same depth as `variants/`,
so their relative imports (`../../../data/hooks`, `../../design/DesignContext`
and so on) still point at the same files they always did — nothing inside them
was edited.

`classic` is the exception. It never had its own folder of pages: it
re-exported the original `src/Pages/`, which in turn used `src/Components/` and
`src/styles/`. Those came along with it:

```
OldThemes/
  classic/index.js     re-exports the pages below
  Pages/               the original page components
  Components/          Breadcrumb, Footer, Header, Icons
  styles/              the twelve stylesheets those pages import
```

Only the paths that would otherwise have escaped the archive were rewritten —
`../context/`, `../data/` and Vesper's reference to `Icons`. Everything still
shared with the live app (`src/data`, `src/context`, `src/shared`,
`src/design`, and `Components/DangerZone`) is still referenced in place.

## Restoring one

1. Move its folder back to `src/variants/`. The import depth is identical in
   both locations, so a self-contained design needs no edits. For `classic`,
   move `Pages/`, `Components/` and `styles/` back to `src/` as well and undo
   the path rewrites named above.
2. Add its import and its `BY_DESIGN` entry in `src/design/registry.js`.
3. Add its entry to `DESIGNS` in `src/design/config.js`.

To let visitors switch between designs again, set `LOCKED` back to `null` in
`src/design/config.js` and restore `DesignSwitcher.jsx` and `switcher.css` from
git history — they were deleted, not moved here, because they are picker
chrome rather than a design.

## A warning about editing these

Nothing compiles these files, so a broken import in here will not fail the
build or the tests — you will only find out when you try to restore the design.
Move a folder back into `src/variants/` and build before trusting an edit.
