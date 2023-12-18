import * as React from 'react';

import type { RenderWhenProps } from './RenderWhen.types';


/* --------
 * Component Definition
 * -------- */
const RenderWhen: React.FunctionComponent<RenderWhenProps> = (props) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    condition
  } = props;


  /** Check if condition is Strict, the only node to render is 'children' */
  if ('children' in props) {
    /** Get props from StrictConditionNode type */
    const { children, isFalse: invertConditionLogic } = props;

    /** Check if the node must render or not */
    if (children && (!invertConditionLogic && condition) || (invertConditionLogic && !condition)) {
      return (
        <React.Fragment>
          {children}
        </React.Fragment>
      );
    }

    /** Return Empty */
    return null;
  }


  /** Get nodes to render from props */
  const { isFalse: whenFalseContent, isTrue: whenTrueContent } = props;


  /** Check the condition to determine which element must be rendered */
  return (
    <React.Fragment>
      {condition ? whenTrueContent : whenFalseContent}
    </React.Fragment>
  );

};

RenderWhen.displayName = 'RenderWhen';

export default RenderWhen;
