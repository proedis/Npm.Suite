import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';


const RxTableHeader = React.forwardRef<HTMLTableSectionElement, React.PropsWithChildren>(
  (props, ref) => {

    const {
      classes,
      styles,
      layout: {
        isVirtualized
      }
    } = useRxTable();


    // ----
    // Component Render
    // ----
    return (
      <Table.Header
        ref={ref}
        component={isVirtualized ? 'div' : 'thead'}
        className={classes.Header}
        style={styles.Header}
      >
        {props.children}
      </Table.Header>
    );
  }
);

RxTableHeader.displayName = 'RxTableHeader';

export default RxTableHeader;
