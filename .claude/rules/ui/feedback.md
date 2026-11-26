---
paths:
  - "packages/ui/src/feedback/**"
  - "apps/platform/src/routes/ui/feedback/**"
  - "apps/platform/src/examples/feedback/**"
---

# `@proedis/ui`: feedback

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

Choices in this section that look improvable and are not:

- **The jobs panel of the notifications is a list of ours**, not a second Base UI toast viewport: its
  rows would be dialogs that Esc closes, swipe, and stop at three. The confirmation is Base UI's toast.
- **Jobs and notifications are two subpaths on one store** (Marco, 2026-11-25). `feedback/notifications`
  owns `createNotifications`, the confirmations and the live regions, so a job is announced even with no
  panel on screen; `feedback/jobs` draws them, `JobsPanel` placed by the application inside the provider and
  `JobsButton`, both reading its context, which throws outside it. One store keeps one history and one pair
  of live regions: two would have to be kept in step.

**`ProgressBar` and `Meter` are one implementation on two primitives** (Marco, 2026-11-25: a real
component, not a bar with `min`, `max` and `value`). What a screen reader hears is the only difference,
`progressbar` or `meter`, so the choice is in the name, and a Meter is never indeterminate by its type.
Three choices that look improvable and are not:

- **The numbers are formatted here, with Base UI's rule** (with `format` the value, without it the
  percentage of the range), because the bounds, the bubble and the copy on the fill need the same string
  Base UI writes for `aria-valuetext`. The written value is `aria-hidden`: the root already says it.
  Base UI's own text for an indeterminate bar is English, so it is replaced by `indeterminateLabel`, or
  dropped.
- **Inside, the value is written twice**, centred on the whole track: once in the ink of the track, once in
  the ink of the fill inside the fill, as wide as the track (`10000 / percentage` %, an inline style, a free
  measure). The fill clips the second, so the text changes colour where the fill passes and reads at any
  value. `inside` needs `lg` or `xl`, a union of the props: a smaller track does not compile with it.
- **The bubble of `floating` moves by its own share** (`inset-inline-start: p%` and `translateX(-p%)`), so it
  is centred in the middle and flush with the bar at both ends, with no measurement. After the bar, the
  value column holds an invisible copy of the largest value, so the bar does not move as the number grows.

- **`EmptyState` is a composition, not a set of cases** (Marco, 2026-11-25): a root with `size` and
  `tone` that its parts read from a context, and `.Icon` (an IconBox, its size the empty state's),
  `.Title`, `.Description`, `.Actions` (the application's Buttons). The `kind` that fixed the tone and the
  look of each action is gone: an application writes its own empty states once. The recipes the package
  needs itself (clear the filters plain destructive with the x, retry solid muted, create soft primary)
  live in Table and ModalSelector, which know their case. An `inline` empty state draws only its icon and
  title, in the ink of the tone.

