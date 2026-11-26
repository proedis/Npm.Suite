---
paths:
  - "packages/ui/src/data/**"
  - "apps/platform/src/routes/ui/data/**"
  - "apps/platform/src/examples/data/**"
---

# `@proedis/ui`: data

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

Choices in this section that look improvable and are not:

- **Every slice of the table's state is controlled or internal, and one `onStateChange(state, change)`
  reports them.** A page keeps in its address only what it wants, and the change says which slice
  moved. What follows from the props (a page past the last one after a filter, the first page after a
  new `filterKey`, an "all" selection left empty) is adjusted during render; the effects only notify,
  because `react-hooks/set-state-in-effect` is right about the cascade.
- **The selection lives outside TanStack Table.** The engine can only choose rows it has loaded; "every
  row of the filter but a few" (`{ all, excludedIds }`) is the case a server list needs.
- **The roving tab index of the grid is written on the DOM after each render**, not through props: the
  controls inside the cells (links, checkboxes, the ⋯, a custom cell) are not ours to render.
- **The lists of FiltersBar are one list of ours** (`FilterList`, `aria-activedescendant` from the
  search or the list), not Base UI's Select or Combobox: the same list is the second step of "More
  filters", inside a Popover, where an engine with its own trigger and popup does not fit. Base UI's
  submenu would open beside the panel instead of replacing it.
- **FiltersBar measures a hidden copy of its row** (`inert`, `aria-hidden`), and keeps the count it
  shows while a list is open: a button never moves under the pointer. When the list that closed takes
  its button into "More filters", the focus follows it there.
- **ModalSelector is a `listbox` drawn as a `<table>`**, with the search as its `combobox`: the focus
  never leaves the search. It takes the Table's pieces, not the Table: no sorting, pages, columns or
  row actions in a selector, where one narrows instead of browsing.

- **`Detail.Grid` is a grid of its own, not `Form.Section`.** It is a `<dl>`, and the spans are scoped to
  nothing: a `Detail.Item` is always in one. Same six columns, same `@max-lg` rule, same three tracks
  per row (the third empty), so a detail and its form line up; `DETAIL_SPAN` extends `FIELD_SPAN`
  rather than repeating it.

