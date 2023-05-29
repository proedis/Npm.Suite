import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';


const RxTableFooter = React.forwardRef<HTMLTableSectionElement, React.PropsWithChildren>(
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
      <Table.Footer
        ref={ref}
        component={isVirtualized ? 'div' : 'tfoot'}
        className={classes.Footer}
        style={styles.Footer}
      >
        {props.children}
      </Table.Footer>
    );
  }
);

RxTableFooter.displayName = 'RxTableFooter';

export default RxTableFooter;
