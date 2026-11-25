import * as React from 'react';

import { cn, splitBaseProps, TONE_CLASSES } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';

import type { BaseProps, PolymorphicProps, Tone } from '@proedis/ui/core';


/* --------
 * A polymorphic component of the application, in the shape of the package's own
 * -------- */

interface StrictNoteProps extends BaseProps {
  /** Defaults to `info` */
  tone?: Tone;
}

type NoteProps<E extends React.ElementType = 'p'> = PolymorphicProps<E, StrictNoteProps>;

function Note<E extends React.ElementType = 'p'>(props: NoteProps<E>): React.ReactNode {
  const { as: Component = 'p', className, tone = 'info', ...others } = props as NoteProps<'p'>;
  const { baseClasses, rest } = splitBaseProps(others);

  return (
    <Component
      data-slot={'note'}
      data-tone={tone}
      className={cn('rounded-lg px-3 py-2 text-sm', TONE_CLASSES.soft[tone], baseClasses, className)}
      {...rest}
    />
  );
}


export default function Example(): React.ReactNode {
  return (
    <Stack gap={3} className={'w-full max-w-md'}>
      <Note>A paragraph, the default element.</Note>
      <Note as={'aside'} tone={'warning'}>An aside, for a remark next to the content.</Note>
      <Note as={'a'} href={'#typing-a-component-of-your-own'} tone={'success'}>A link: href is accepted because the element is an anchor.</Note>
    </Stack>
  );
}
