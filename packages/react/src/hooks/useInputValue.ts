import * as React from 'react';


export function useInputValue(initialValue?: string): [
  string,
  React.ChangeEventHandler<HTMLInputElement>,
  React.Dispatch<React.SetStateAction<string>>
] {

  // ----
  // Internal Hooks
  // ----
  const [ value, setValue ] = React.useState<string>(initialValue ?? '');


  // ----
  // Handler
  // ----
  const handleInputValueChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setValue(event.currentTarget.value);
    },
    []
  );


  // ----
  // Hook Returns
  // ----
  return [ value, handleInputValueChange, setValue ];

}
