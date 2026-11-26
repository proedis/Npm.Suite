---
paths:
  - "packages/ui/src/layout/**"
  - "apps/platform/src/routes/ui/layout/**"
  - "apps/platform/src/examples/layout/**"
  - "packages/ui/src/primitives/**"
  - "apps/platform/src/routes/ui/primitives/**"
  - "apps/platform/src/examples/primitives/**"
---

# `@proedis/ui`: layout and primitives

Moved verbatim from `packages/ui/CLAUDE.md`, which holds the invariants of the whole package: an "above" or a "below" in the text points there.

Choices in this section that look improvable and are not:

- **`divided` resets the other axis, per breakpoint.** A stack whose direction changes at `lg` keeps
  its `base` divider rule in effect, so both rules would be drawn from `lg` on. The reset is not
  belt-and-braces.
- **`min-h-0 min-w-0` on `ScrollArea` is load-bearing.** A flex child refuses to shrink below its
  content, so without it the scroll never engages and the parent grows instead.

- **`Box` is the bottom of the package and emits no display of its own.** It was `Show`, a wrapper
  hardcoded to `display: contents`, and that component turned out to be a special case of a more
  useful one: once every primitive took the shared props, what was left of it was "an element with the
  shared props", which is exactly `Box`. It emits **no class at all** when it has nothing to say — not
  even `class=""` — so it composes with whatever the caller writes.
  ⚠️ `contents` therefore became a **literal class the caller writes**, `<Box className={'contents'}>`,
  which is right by the `BaseProps` criterion: a literal class is found by the scanner for free. It is
  also still the only correct place for `contents` — on a primitive that owns a layout it would leave
  that component's own `gap` and alignment inert, silently, for the reason above.
  Hiding stays CSS either way, so the children remain **mounted**: for a subtree with a cost, use
  `useIsMobile` and render nothing.

- **`Split` takes its rail as a prop, and the width travels as a custom property.** The prop is what
  lets `side={'end'}` put the rail *after* the content in the DOM, so the reading and tab order match
  the eye; two children in a fixed order could only be reordered visually. The custom property is
  what makes `collapseBelow` possible: a media query cannot live in an inline style, so the responsive
  half has to be a class, and a class cannot carry an arbitrary length. `*:min-w-0` is load-bearing —
  a grid item refuses to shrink below its content, so a wide table in the flexible pane would push
  the frame past the viewport.
- **`Bleed`'s default is a copy of `Container`'s padding, and they move together.** `px-4 sm:px-6
  lg:px-8` against `-mx-4 sm:-mx-6 lg:-mx-8`. CSS cannot derive one from the other, and a bleed that
  undoes the wrong amount is off by a few pixels at one breakpoint only, which is the kind of defect
  that survives review.

