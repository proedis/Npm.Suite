import * as React from 'react';

import { createStyles, Collapse, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { ButtonGroup } from '../Button';
import Header from '../Header';
import IconButton from '../IconButton';

import type { PanelProps } from './Panel.types';


/* --------
 * Styles Definition
 * -------- */
const useStyles = createStyles<string, { hasFab: boolean }>((theme, params) => ({

  panel: {
    position       : 'relative',
    backgroundColor: theme.white,
    borderRadius   : theme.radius.lg,
    padding        : theme.spacing.lg,
    paddingBottom  : params.hasFab ? theme.spacing.xl : theme.spacing.lg,
    boxShadow      : theme.shadows.xs,
    marginBottom   : params.hasFab ? `calc(${theme.spacing.md} * 2.5)` : theme.spacing.md
  },

  panelFabs: {
    position    : 'absolute',
    bottom      : 0,
    right       : 0,
    paddingRight: theme.spacing.lg,
    paddingLeft : theme.spacing.lg,
    transform   : 'translateY(50%)'
  }

}));


/* --------
 * Component Definition
 * -------- */
const Panel: React.FunctionComponent<PanelProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    content,
    children,

    className,

    fabs,
    header,

    collapsable,
    defaultOpen
  } = props;


  // ----
  // Internal Hooks
  // ----
  const [ opened, { toggle } ] = useDisclosure(!!defaultOpen);
  const { classes, cx } = useStyles({ hasFab: Array.isArray(fabs) && !!fabs.length });


  // ----
  // Render the Header of the Panel
  // ----
  const hasContent = content || children;
  const headerElement = React.useMemo(
    () => {
      /** If no header content has been provided, return null */
      if (!header) {
        return null;
      }

      /** Draw the element using style */
      return Header.create(header, {
        autoGenerateKey: false,
        defaultProps   : {
          fit: !hasContent
        }
      });
    },
    [ header, hasContent ]
  );


  // ----
  // Render the Fabs Section
  // ----
  const fabsElement = Array.isArray(fabs) && !!fabs.length && (
    <ButtonGroup className={classes.panelFabs}>
      {fabs.map(fab => IconButton.create(fab, { autoGenerateKey: true }))}
    </ButtonGroup>
  );


  // ----
  // Define ClassNames
  // ----
  const componentClasses = cx(classes.panel, className);


  // ----
  // Component Render
  // ----
  if (!collapsable) {
    return (
      <div className={componentClasses}>
        {headerElement}
        <div>
          {content || children}
        </div>
        {fabsElement}
      </div>
    );
  }


  return (
    <div className={componentClasses}>
      <Grid>
        <Grid.Col span={'content'}>
          <IconButton
            color={'cloud.4'}
            icon={opened ? 'angle-down' : 'angle-up'}
            variant={'subtle'}
            onClick={toggle}
          />
        </Grid.Col>
        <Grid.Col span={'auto'}>
          {headerElement}
        </Grid.Col>
      </Grid>

      <Collapse in={opened}>
        <div>
          {content || children}
        </div>
      </Collapse>

      {fabsElement}
    </div>
  );

};

Panel.displayName = 'Panel';

export default Panel;
