import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, EnumPropertyType } from '../../../types/openapi';


export class EnumProperty extends AbstractedProperty<EnumPropertyType> {

  private get isDescribed(): boolean {
    return !!this.schema['x-enum-described'];
  }


  private get isFlag(): boolean {
    return !!this.schema['x-enum-as-flags'];
  }


  get dependencies(): PropertyDependency[] {
    if (!this.isDescribed) {
      return [
        {
          name: this.schema['x-element-name'],
          from: undefined
        }
      ];
    }

    return [
      {
        name: this.isFlag ? 'AsFlags' : 'AsEnum',
        from: '@proedis/modeler'
      },
      {
        name: this.isFlag ? 'Flags' : 'Enum',
        from: '@proedis/modeler'
      }
    ];
  }


  get decorators(): string[] {
    return this.isDescribed
      ? [ `@${this.isFlag ? 'AsFlags' : 'AsEnum'}('${this.schema['x-element-name']}')` ]
      : [];
  }


  get propertyType(): string {
    const suffix = this.schema.items ? '[]' : '';

    return this.isDescribed
      ? `${this.isFlag ? 'Flags' : 'Enum'}<'${this.schema['x-element-name']}'>${suffix}`
      : `${this.schema['x-element-name']}${suffix}`;
  }

}
