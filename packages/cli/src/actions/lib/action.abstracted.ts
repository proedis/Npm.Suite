import type { AnyObject } from '@proedis/types';

import type { ActionInputs } from './action.inputs';


export abstract class AbstractAction<Schema extends AnyObject> {

  public abstract handle(inputs: ActionInputs<Schema>): Promise<void>;

}
