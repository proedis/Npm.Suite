import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Container, Stack } from '@proedis/ui/layout';
import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';

import { SECTIONS } from '@/platform/sections';

import type { PlatformSection } from '@/platform/sections';


/* --------
 * Parts
 * -------- */

/** A section of the platform, as a card that leads to its first page */
function SectionCard(props: { section: PlatformSection }): React.ReactNode {
  const { section } = props;
  const Icon = section.icon;

  return (
    <Stack
      as={Link}
      to={section.to}
      gap={2}
      className={'group h-full rounded-xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/40'}
    >
      <Stack direction={'horizontal'} align={'center'} gap={2}>
        <Icon aria-hidden className={'size-5 shrink-0 text-muted-foreground group-hover:text-primary'} />
        <span className={'font-semibold text-foreground'}>{section.title}</span>
        {section.version && (
          <Badge size={'sm'} fill={'soft'} tone={'secondary'} className={'ms-auto font-mono'}>{section.version}</Badge>
        )}
      </Stack>
      <p className={'text-sm/6 text-muted-foreground'}>{section.description}</p>
    </Stack>
  );
}


/* --------
 * Page
 * -------- */

/** The home of the platform: what it is, and its sections */
function PlatformHome(): React.ReactNode {
  return (
    <Container size={'xl'}>
      <Stack as={'main'} gap={10} className={'pt-16 pb-24'}>
        <Heading size={'xl'}>
          <Heading.Eyebrow>Proedis</Heading.Eyebrow>
          <Heading.Title as={'h1'}>Internal Platform</Heading.Title>
          <Heading.Description>
            The internal site of the development team: the documentation of the packages we publish, and what we keep
            for ourselves. Public by address, meant for internal use.
          </Heading.Description>
        </Heading>

        <Stack as={'ul'} columns={{ base: 1, md: 2, lg: 3 }} gap={'md'}>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <SectionCard section={section} />
            </li>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/')({
  component: PlatformHome
});
