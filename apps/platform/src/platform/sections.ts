import { Component } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { NAV } from '@/nav';


import type { NavGroup } from '@/nav';


/*
 * The sections of Proedis Internal Platform. Each one is a subtree of routes under its own prefix, with
 * its navigation: the bar of the platform names the section a page belongs to, and the section's layout
 * route draws its rail. A new section is a folder of routes, a navigation, and one entry here.
 */


/* --------
 * Types Definition
 * -------- */

export interface PlatformSection {
  readonly id: string;

  /** Shown in the bar and on the home of the platform */
  readonly title: string;

  /** One line, on the home */
  readonly description: string;

  /** The prefix of every route of the section, and the address of its first page */
  readonly to: string;

  readonly icon: LucideIcon;

  /** A version shown next to the title, when the section documents a package */
  readonly version?: string;

  /** The navigation of its rail, when it has one */
  readonly nav?: readonly NavGroup[];
}


/* --------
 * Constants Definition
 * -------- */

export const SECTIONS: readonly PlatformSection[] = [
  {
    id         : 'ui',
    title      : 'Proedis UI',
    description: 'The interface layer of a Proedis frontend: primitives, components and forms, one page each, with live examples.',
    to         : '/ui',
    icon       : Component,
    version    : '2.0',
    nav        : NAV
  }
];


/* --------
 * Helpers
 * -------- */

/** The section an address belongs to, or none on the home and the pages of the platform itself */
export function sectionAt(pathname: string): PlatformSection | undefined {
  return SECTIONS.find((section) => pathname === section.to || pathname.startsWith(`${section.to}/`));
}
