import * as React from 'react';

import { useRxTable } from '../RxTable.context';


const RxTableHeaderWrapper = React.forwardRef<HTMLDivElement, React.PropsWithChildren>(
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
    if (!isVirtualized) {
      return (
        <React.Fragment>
          {props.children}
        </React.Fragment>
      );
    }


    // ----
    // Return Composed Component
    // ----
    return (
      <div
        ref={ref}
        className={classes.HeaderWrapper}
        style={styles.HeaderWrapper}
      >
        {props.children}
      </div>
    );

  }
);

RxTableHeaderWrapper.displayName = 'RxTableHeaderWrapper';

export default RxTableHeaderWrapper;
