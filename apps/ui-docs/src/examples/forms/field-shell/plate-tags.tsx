import * as React from 'react';

import { X } from 'lucide-react';

import { Badge } from '@proedis/ui/display/badge';
import { Field, useFieldControl } from '@proedis/ui/forms/field';
import { FieldShell } from '@proedis/ui/forms/field-shell';
import { Cluster } from '@proedis/ui/layout';

import type { FieldShellSize } from '@proedis/ui/forms/field-shell';


/* --------
 * Types Definition
 * -------- */

interface PlateTagsProps {
  value: readonly string[];
  onChange: (value: string[]) => void;
  size?: FieldShellSize;
  readOnly?: boolean;
  invalid?: boolean;
}


/* --------
 * Component Definition
 * -------- */

/**
 * A control of the application: plates as chips, typed one at a time. Enter adds one, Backspace on
 * an empty text removes the last. The frame is FieldShell, so it looks and behaves like a TextInput.
 */
export function PlateTags(props: PlateTagsProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { invalid, onChange, readOnly = false, size, value } = props;


  // ----
  // Internal Hooks
  // ----
  const { disabled, labelId, required } = useFieldControl();


  // ----
  // Internal State
  // ----
  const [ draft, setDraft ] = React.useState('');


  // ----
  // Handlers
  // ----
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(event.currentTarget.value.toUpperCase());
  }, []);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && draft.trim()) {
      event.preventDefault();
      onChange([ ...value, draft.trim() ]);
      setDraft('');
    }

    if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }, [ draft, onChange, value ]);


  // ----
  // Component Render
  // ----
  return (
    <FieldShell size={size} readOnly={readOnly} invalid={invalid} className={'h-auto min-h-control-md py-1'}>
      <Cluster gap={1} className={'w-full'}>
        {value.map((plate) => (
          <Badge key={plate} fill={'soft'} tone={'secondary'} className={'font-mono'}>
            {plate}
            {!readOnly && !disabled && (
              <X aria-hidden className={'size-3 cursor-pointer'} onMouseDown={() => onChange(value.filter((item) => item !== plate))} />
            )}
          </Badge>
        ))}
        <input
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={value.length ? undefined : 'Type a plate, then Enter'}
          data-field-control={''}
          aria-labelledby={labelId}
          aria-required={required || undefined}
          className={'h-6 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-placeholder'}
        />
      </Cluster>
    </FieldShell>
  );

}


/** The control in a field, as a form would use it */
export default function Example(): React.ReactNode {
  const [ plates, setPlates ] = React.useState<string[]>([ 'AB 123 CD', 'FT 234 KL' ]);

  return (
    <Field
      className={'w-full max-w-md'}
      required
      label={'Vehicles on the round'}
      description={'Press the frame anywhere: the focus lands in the text'}
    >
      <PlateTags value={plates} onChange={setPlates} />
    </Field>
  );
}
