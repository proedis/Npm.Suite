import { AbstractedProperty } from './AbstractedProperty';

import type { PropertyDependency, EnumPropertyType } from '../../../types/openapi';


export class EnumProperty extends AbstractedProperty<EnumPropertyType> {

  private get isDescribed(): boolean {
    return !!this.schema['x-enum-described'];
  }


  private get isFlag(): boolean {
    return !!this.schema['x-enum-as-flags'];
  }


  public get requirements(): string {
    return this.isFlag && !this.isNullable ? '' : super.requirements;
  }


  protected get propertyDefault(): string {
    return this.isFlag && !this.isNullable
      ? ` = new Flags<'${this.schema['x-element-name']}'>('${this.schema['x-element-name']}', [])`
      : super.propertyDefault;
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
    return this.isDescribed
      ? `${this.isFlag ? 'Flags' : 'Enum'}<'${this.schema['x-element-name']}'>`
      : this.schema['x-element-name'];
  }

}
