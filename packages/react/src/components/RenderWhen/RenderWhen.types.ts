import type * as React from 'react';


export type RenderWhenProps =
  & StrictRenderWhenProps
  & (StrictConditionNode | TernaryConditionNodes);

export interface StrictRenderWhenProps {
  /** The condition to evaluate to check the node to render */
  condition: boolean;
}

interface StrictConditionNode {
  /** Children to render when the condition will pass */
  children: React.ReactNode;

  /** Invert the condition logic, rendering children only if the result is false */
  isFalse?: boolean;
}

interface TernaryConditionNodes {
  /** The node to render when the condition is false */
  isFalse?: React.ReactNode;

  /** The node to render when the condition is true */
  isTrue?: React.ReactNode;
}
