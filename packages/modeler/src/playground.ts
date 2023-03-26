import 'reflect-metadata';

import { Default, Model, Expose } from './decorators';

import Entity from './Entity';


@Model('MyClass')
class MyClass extends Entity {

  @Expose()
  @Default(Date.now)
  creationDate!: Date;

  @Expose()
  aNumber!: number;

  @Expose()
  @Default(15)
  aNumber2!: number;

}


new MyClass({ aNumber: '15', aNumber2: 'bla' });

process.exit(0);
