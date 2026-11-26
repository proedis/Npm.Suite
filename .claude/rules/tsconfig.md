---
paths:
  - "packages/tsconfig/**"
  - "**/tsconfig*.json"
---

# `@proedis/tsconfig` and the tsconfig files

Moved verbatim from the root `CLAUDE.md`.

`@proedis/tsconfig` resolves modules the same way everywhere: **every preset sets
`moduleResolution: bundler`**, `base` included since 2.0.1. `base` used to keep the classic `node`
algorithm, on the argument that it is what a Node consumer and a declaration emit both need;
TypeScript 7 removed that algorithm outright, so a preset carrying it fails to load on the current
compiler, and `node16` is not a replacement because it demands `module: Node16` while every preset
here emits `ESNext`. Note what the setting decides: how a project reads *its* dependencies, not how a
consumer reads the declarations it emits.

`declaration` is **not** a preset but an overlay with no `extends` of its own, composed *last* in an
`extends` array so its `noEmit: false` and `composite: true` win:

```json
{ "extends": [ "@proedis/tsconfig/react", "@proedis/tsconfig/declaration" ] }
```

That composition is the point: before it, every React package emitted its declarations under the
base preset's resolution and a hardcoded `jsx` override, i.e. with different settings from the ones
it typechecked with.

