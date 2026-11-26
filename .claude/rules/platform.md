---
paths:
  - "apps/platform/**"
  - "*.captain-definition"
---

# The platform, `apps/platform`

Moved verbatim from the root `CLAUDE.md`.

### The platform, `apps/platform`

`@proedis/platform` is **Proedis Internal Platform** (Marco, 2026-11-25): a site public by address and
internal by use, made of sections. The documentation of `@proedis/ui` is the first, under `/ui`; the next
ones (the docs of the other packages, internal tools) arrive the same way. Vite, TanStack Router (file
routes, `src/routeTree.gen.ts` generated and committed), Tailwind 4, Lucide. `yarn workspace
@proedis/platform dev` serves it on port 3200. It is `private`, so `lerna version` skips it and
`release:verify` never sees it; `release:build` does build it, after `ui`.

**A section is a prefix, a folder of routes, a navigation and one entry in `src/platform/sections.ts`.**
The root route draws the bar of the platform (`PlatformHeader`: the name, the section of the page with its
version, the theme) and nothing else; a section's layout route (`src/routes/ui/route.tsx`) draws its own
frame, `DocsLayout` with its rail. `sectionAt(pathname)` tells which section a page is in. `src/nav.ts` is
the navigation of the UI section: a second section brings its own and passes it to `Sidebar`, which takes
its groups as a prop. `/` is the home of the platform, a card per section. `/preview/<id>` stays at the
root, outside every section, since it renders one example alone. A link inside a section is written with
its prefix (`/ui/forms/text-input`): the router types every address, so a link without it does not
compile.

**It is kept out of search engines**, by decision: `noindex, nofollow` in a meta of `index.html`, in an
`X-Robots-Tag` header from nginx, and a `robots.txt` that disallows everything.

**Deployed on CapRover from the repository.** `apps/platform/Dockerfile` builds from the root of the
monorepo (the site compiles the source of the workspace packages, so the context is the whole repository,
which `.dockerignore` trims) in a Node 22 stage with Yarn through corepack, and serves `build/` with
nginx (`apps/platform/nginx.conf`: the fallback of a single page application, the hashed assets cached for
a year, the page never). **One definition per app, at the root of the repository: `<app>.captain-definition`** (Marco,
2026-11-25), so a second app deployed from this repository adds its own file beside it. CapRover resolves
`dockerfilePath` against the folder of the definition and uses that same folder as the build context,
whatever its documentation says: read in its `ImageMaker.ts`, and proved by the first deploy, which looked
for `apps/platform/apps/platform/Dockerfile`. A definition inside `apps/platform` would build with that
folder alone, without the packages the site compiles; at the root the context is the whole repository.
The app's "Captain Definition Path" is `./platform.captain-definition`. nginx listens on 80. Deploying is Marco's to start: nothing
in this repository pushes or deploys.

**It reads the package's source, not a build.** `@proedis/ui` and every `@proedis/ui/<subpath>` are
aliased onto `packages/ui/src` in both `vite.config.ts` and `tsconfig.json` (the source manifest
declares no subpath), and React is deduplicated, so the site always documents the branch it is on.

Three Vite plugins under `plugins/` carry the site, and each exists so a page cannot drift from the
package:

- **`?example`**: `import x from '@/examples/<section>/<component>/<name>.tsx?example'` gives the
  component and its own source, highlighted by Shiki at build time in two themes at once. The code
  under a preview is the file that drew it. `?source` gives the highlighted source alone, for a module
  with nothing to render (fixtures, labels, the module of an entity), so a page never shows a copy.
- **Tagged snippets**: `` tsx`…` ``, `` css`…` ``, `` bash`…` `` from `@/docs/snippet` are replaced by their
  highlighted result while building. No highlighter reaches the browser.
- **`virtual:ui-props/<Type>`**: the props of an exported type of the package, read by the
  TypeScript compiler from its source: type as written, literal values, default (from `@default`,
  the ``Defaults to `x` `` sentence of the JSDoc, or the `defaultVariants` of a `cva` variant),
  requiredness, JSDoc, declaring interface. A default that lives only in a destructure is invisible to
  it: the page states it under the table, and the fix is a JSDoc sentence in the package. Only the
  props the package declares; what comes from a native element or Base UI is one line on the page.
  A prop the component writes back as a `data-*` attribute is marked with it, read from the
  component's own folder (`data-size={size}`, `'data-loading': loading`): an attribute written by a
  shared module elsewhere is not found, which leaves a mark missing rather than inventing one.
- **`virtual:ui-theme/<section>/<name>`**: the variables of the theme a component reads, worked out from
  the classes its modules write (read from the syntax tree, `data-*` values skipped) translated through
  `ui.css` and `theme.css`, with their light and dark defaults. Every component page renders them in its
  Customization section, and `virtual:ui-theme/all` feeds the Customization page of Foundations, so a page
  cannot promise a variable the component does not read. The layout primitives and the class builders are
  left out of a component's graph: components render them with props of their own.

**The slots of a component are inspected on a live example, never listed from memory.** Every slots
section is a `SlotsInspector` (`src/docs/SlotsInspector.tsx`) over the example that shows the most of
its parts, measured page by page: hovering or focusing a row outlines the elements of that `data-slot`,
each row shows the `data-*` they carry right now (a `MutationObserver` on the preview and on the body,
for what a menu or a dialog draws in a portal), and a rule tried below is applied to that preview and
its portals alone. The preview sticks under the bar while the table scrolls. A modal overlay makes the
page inert while open, which its inspector says (`modal`): set the rule first, then open it.

**A responsive example is judged in a frame, never on the window.** `<Example of={x} resizable />`
renders the example in a same-origin iframe of the site's own `/preview/<id>` route, whose width the
reader drags from a handle or picks from a preset per breakpoint: Tailwind's breakpoints are media
queries, and only a viewport of its own makes one fire for a box narrower than the window. The frame
reports its content height by `postMessage`, follows the site theme through the `storage` event, and is
drawn scaled when wider than the column. Not for an overlay, which the frame would confine.

`src/nav.ts` is the one list of pages: sidebar, pager and overview read it, and a page not yet written
is listed with `ready: false`, greyed and not linked. A page names itself with `pageAt(route)`.

The site lays out through the primitives like any consumer should: the `suite/platform-layout` block of
the root ESLint config forbids hand-written `flex`, `grid` and `gap-*`, but only in class contexts
(`className`, `cn()`), since most of the site is prose about grids. A claim a page makes about types
(a negative case that must not compile) is verified with a throwaway `@ts-expect-error` file before it
is written down, in both directions.

