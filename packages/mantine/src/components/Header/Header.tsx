import * as React from 'react';

import { Flex, Text, Title, createStyles } from '@mantine/core';
import type { TitleOrder } from '@mantine/core';

import { creatableComponent } from '@proedis/react';

import { ButtonGroup } from '../Button';

import type { HeaderProps } from './Header.types';
import IconButton from '../IconButton';


/* --------
 * Style Definition
 * -------- */
const useStyles = createStyles({

  headerContent: {
    flexGrow  : 1,
    flexShrink: 0
  }

});


/* --------
 * Constants
 * -------- */
const TITLE_ORDER_MAP: Record<Exclude<HeaderProps['size'], undefined>, TitleOrder> = {
  xs: 6,
  sm: 4,
  md: 3,
  lg: 2,
  xl: 1
};


/* --------
 * Component Definition
 * -------- */
const HeaderBase: React.FunctionComponent<HeaderProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,

    actions,
    centered,
    fit,
    title,
    size,
    subtitle
  } = props;


  // ----
  // Internal Hooks
  // ----
  const { classes, theme } = useStyles();


  // ----
  // Create the Header Title Element
  // ----
  const titleElement = React.useMemo(
    () => !!title && (
      <Title order={TITLE_ORDER_MAP[size ?? 'md']} fw={theme.other.fontWeight.medium}>{title}</Title>
    ),
    [ title, theme, size ]
  );

  const subheaderElement = React.useMemo(
    () => !!subtitle && (
      <Text fw={theme.other.fontWeight.normal} fz={size} opacity={.5}>{subtitle}</Text>
    ),
    [ subtitle, theme, size ]
  );


  // ----
  // Render the Actions Section
  // ----
  const actionsElement = Array.isArray(actions) && !!actions.length && (
    <ButtonGroup>
      {actions.map(action => IconButton.create(action, { autoGenerateKey: true }))}
    </ButtonGroup>
  );


  // ----
  // Component Render
  // ----
  return (
    <Flex
      className={className}
      wrap={'nowrap'}
      justify={'flex-start'}
      align={centered ? 'center' : 'start'}
      gap={'lg'}
      mb={fit ? undefined : 'md'}
      w={'100%'}
    >
      <div className={classes.headerContent}>
        {titleElement}
        {subheaderElement}
      </div>
      {actionsElement}
    </Flex>
  );

};


/* --------
 * Convert to Creatable Component
 * -------- */
const Header = creatableComponent(
  HeaderBase,
  (title: HeaderProps['title']) => ({ title })
);

Header.displayName = 'Header';

export default Header;
