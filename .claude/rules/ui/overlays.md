---
paths:
  - "packages/ui/src/overlays/**"
  - "apps/platform/src/routes/ui/overlays/**"
  - "apps/platform/src/examples/overlays/**"
---

# `@proedis/ui`: overlays

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

Choices in this section that look improvable and are not:

- **The nesting of dialogs is a context of ours** (`OverlayLevelContext`), not Base UI's `data-nested`:
  a dialog opened from inside another must be rendered inside it, and then sits lower over a lighter
  veil. The discard prompt of `dirty` is rendered inside its dialog for that reason.

- **A Dialog gives the first focus to a field of its toolbar before one of its body**: a search on top
  is the field a selector opens on.

- **The veil of an overlay comes at once** (Marco, 2026-11-25). `useOverlayBusy` asks `useDelayedBusy`
  for `{ delay: 0 }`: the 300ms default, right for a wait nobody asked for (a table refreshing, a remote
  search), read after a press as an interface slow to react. The veil fades in over 150ms and keeps the
  400ms minimum, which is what stops a fast answer from blinking. While saving the header goes under it
  (`z-20` only while not inert, so the x of a loading dialog stays usable), and the veil reads
  `rounded-overlay`, so it covers the whole panel at its corner.
- **The three overlays share one corner** (Marco, 2026-11-25). `--overlay-radius` is the corner of
  Dialog, Drawer and AlertDialog, `lg` undeclared; `--dialog-radius`, `--drawer-radius` and
  `--alert-dialog-radius` let one of them differ and fall back to it. The panel carries the variable of
  its component (`overlay-corner-dialog` & co.) or the step of its `radius` prop (`overlay-corner-xl`),
  and the panel and its waiting veil both read `rounded-overlay`, so the veil never shows a square corner
  over a round one. `radius` has a `default` member for the reason `Button.radius` has one. The Drawer
  also takes `variant`: `floating` (8px from the edges, the default) or `attached` (against the right
  edge, the top and the bottom, square, no `data-radius`), and `--drawer-inset` follows either.

