import * as React from 'react';

import { useRxTable } from '../RxTable.context';

import Table from '../../Table';


const RxTableBody = React.forwardRef<HTMLTableSectionElement, React.PropsWithChildren>(
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
      <Table.Body
        ref={ref}
        component={isVirtualized ? 'div' : 'tbody'}
        className={classes.Body}
        style={styles.Body}
      >
        {props.children}
      </Table.Body>
    );
  }
);

RxTableBody.displayName = 'RxTableBody';

export default RxTableBody;
