/**
 * @proedis/ui/interactive
 *
 * The tier with behaviour: form controls, and the overlays and state machines that follow them. Its
 * logic and its structure are shared; its look is a default every application is expected to retune
 * from its own stylesheet, through the `data-slot` and `data-*` attributes every part reports.
 *
 * It is a subpath of its own, and the root barrel does **not** re-export it, for one reason:
 * everything here runs on `@base-ui/react`, which is an **optional** peer. A project that uses the
 * layout and the chrome tiers installs nothing new; a project that imports from here installs it.
 *
 * Client-only: every module carries `'use client'`.
 */

export * from './Field';

export * from './FormGrid';

export * from './TextInput';
