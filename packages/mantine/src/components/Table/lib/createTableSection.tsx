import * as React from 'react';
import { clsx } from '@mantine/core';

import { renderShorthandContent } from '@proedis/react';
import type { UIComponentProps } from '@proedis/react';

import { Box, createPolymorphicComponent } from '@mantine/core';


export default function createTableSection<T, C extends React.ElementType>(
  name: string,
  component: C,
  classNameRef: string
) {

  const _TableSection = React.forwardRef<T, UIComponentProps<{}>>(
    (props, ref) => {

      // ----
      // Props Deconstruct
      // ----
      const {
        children,
        content,

        className,

        ...rest
      } = props;


      // ----
      // Component Render
      // ----
      return (
        // @ts-ignore
        <Box
          component={component}
          ref={ref}
          {...rest}
          className={clsx(classNameRef, className)}
        >
          {renderShorthandContent({ children, content })}
        </Box>
      );

    }
  );

  const TableSection = (
    createPolymorphicComponent<C, UIComponentProps<{}>>(_TableSection)
  );

  TableSection.displayName = name;

  return TableSection;

}
