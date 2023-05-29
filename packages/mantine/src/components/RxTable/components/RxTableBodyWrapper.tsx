import * as React from 'react';

import { useRxTable } from '../RxTable.context';


const RxTableBodyWrapper = React.forwardRef<HTMLDivElement, React.PropsWithChildren>(
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
        className={classes.BodyWrapper}
        style={styles.BodyWrapper}
      >
        {props.children}
      </div>
    );

  }
);

RxTableBodyWrapper.displayName = 'RxTableBodyWrapper';

export default RxTableBodyWrapper;
