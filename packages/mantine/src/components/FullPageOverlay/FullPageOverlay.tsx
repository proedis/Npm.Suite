import * as React from 'react';

import { renderShorthandContent } from '@proedis/react';

import { Box, Center, createStyles, clsx } from '@mantine/core';

import type { FullPageOverlayProps } from './FullPageOverlay.types';


/* --------
 * Style Builder
 * -------- */
const useStyle = createStyles((theme) => ({
  fullPageLoader: {
    position: 'fixed',
    top     : 0,
    left    : 0,
    width   : '100%',
    height  : '100%',
    zIndex  : 99_999,
    padding : theme.spacing.lg
  }
}));


/* --------
 * Component Definition
 * -------- */
const FullPageOverlay: React.FunctionComponent<FullPageOverlayProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    children,
    content
  } = props;


  // ----
  // Internal Hooks
  // ----
  const style = useStyle();


  // ----
  // Classes Definition
  // ----
  const classes = clsx(
    className,
    style.classes.fullPageLoader
  );


  // ----
  // Component Render
  // ----
  return (
    <Center className={classes}>
      <Box ta={'center'}>
        {renderShorthandContent({ children, content })}
      </Box>
    </Center>
  );

};

FullPageOverlay.displayName = 'FullPageOverlay';

export default FullPageOverlay;
