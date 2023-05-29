import * as React from 'react';

import { creatableComponent } from '@proedis/react';

import { Loader as BaseLoader } from '@mantine/core';

import type { LoaderProps } from './Loader.types';


/* --------
 * Component Definition
 * -------- */
const LoaderBase: React.FunctionComponent<LoaderProps> = (props) => (
  <BaseLoader {...props} />
);

const Loader = creatableComponent(
  LoaderBase,
  (size: LoaderProps['size']) => ({ size })
);

Loader.displayName = 'Loader';

export default Loader;
