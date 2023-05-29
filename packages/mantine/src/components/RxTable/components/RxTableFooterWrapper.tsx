import * as React from 'react';

import { useRxTable } from '../RxTable.context';


const RxTableFooterWrapper = React.forwardRef<HTMLDivElement, React.PropsWithChildren>(
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
        className={classes.FooterWrapper}
        style={styles.FooterWrapper}
      >
        {props.children}
      </div>
    );

  }
);

RxTableFooterWrapper.displayName = 'RxTableFooterWrapper';

export default RxTableFooterWrapper;
