import * as React from 'react';

import { creatableComponent } from '@proedis/react';

import { Box, Text, useMantineTheme, useComponentDefaultProps } from '@mantine/core';

import Button, { ButtonGroup } from '../Button';
import Icon from '../Icon';

import type { EmptyContentProps } from './EmptyContent.types';


/* --------
 * Component Default Props
 * -------- */
const defaultProps: Partial<EmptyContentProps> = {
  color: 'cloud.3'
};


/* --------
 * Component Render Definition
 * -------- */
const EmptyContentBase: React.FunctionComponent<EmptyContentProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    // @ts-ignore
    actions,
    color,
    content,
    header,
    icon,

    ...restBoxProps
  } = useComponentDefaultProps<Partial<EmptyContentProps>>('EmptyContent', defaultProps, props);


  // ----
  // Internal Hook
  // ----
  const theme = useMantineTheme();


  // ----
  // Memoized Components
  // ----
  const headerElement = React.useMemo(
    () => !!header && (
      <Text color={color} fz={'xl'} fw={theme.other.fontWeight.bold}>{header}</Text>
    ),
    [ header, color, theme.other.fontWeight.bold ]
  );

  const contentElement = React.useMemo(
    () => !!content && (
      <Text color={color} fw={theme.other.fontWeight.medium}>{content}</Text>
    ),
    [ content, color, theme.other.fontWeight.medium ]
  );

  const iconElement = React.useMemo(
    () => (
      Icon.create(icon, {
        autoGenerateKey: false,
        overrideProps  : {
          color,
          fz: 48
        }
      })
    ),
    [ icon, color ]
  );

  const actionsElement = !!(Array.isArray(actions) && actions.length) && (
    <ButtonGroup justify={'center'} mt={'md'}>
      {actions.map((action) => Button.create(action, { autoGenerateKey: true }))}
    </ButtonGroup>
  );


  // ----
  // Component Render
  // ----
  return (
    <Box ta={'center'} px={'lg'} py={'xl'} {...restBoxProps}>
      {iconElement && (
        <Box mb={'md'}>
          {iconElement}
        </Box>
      )}
      {headerElement}
      {contentElement}
      {actionsElement}
    </Box>
  );

};

const EmptyContent = creatableComponent(
  EmptyContentBase,
  (content: React.ReactNode) => ({ content })
);

EmptyContent.displayName = 'EmptyContent';

export default EmptyContent;
