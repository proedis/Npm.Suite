import * as React from 'react';

import { Field, useFieldControl } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';


/**
 * A control of the application: a fill level from 0 to 100. It reads its field like the controls of
 * the package do, so the asterisk, the error and the announcement cannot disagree.
 */
function FillLevel(props: { value: number; onChange: (value: number) => void }): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { onChange, value } = props;


  // ----
  // Internal Hooks
  // ----
  const { disabled, invalid, labelId, required } = useFieldControl();


  // ----
  // Handlers
  // ----
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.currentTarget.value));
  }, [ onChange ]);


  // ----
  // Component Render
  // ----
  return (
    <Stack direction={'horizontal'} align={'center'} gap={3}>
      <input
        type={'range'}
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        data-field-control={''}
        aria-labelledby={labelId}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={'w-full accent-primary'}
      />
      <span className={'w-10 text-end text-sm text-muted-foreground tabular-nums'}>{value}%</span>
    </Stack>
  );
}


export default function Example(): React.ReactNode {
  const [ level, setLevel ] = React.useState(95);

  return (
    <Field className={'w-full max-w-sm'}>
      <Field.Label required>Fill level at the last pass</Field.Label>
      <FillLevel value={level} onChange={setLevel} />
      <Field.Description>As read by the sensor of the bin</Field.Description>
      <Field.Error>{level > 90 ? 'Over 90%: plan an extra pass' : null}</Field.Error>
    </Field>
  );
}
