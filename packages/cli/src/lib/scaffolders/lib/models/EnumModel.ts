import type { EnumSchema, PropertyDependency } from '../../types/openapi';

import { type ModelsRepository } from './ModelsRepository';

import { AbstractedModel } from './AbstractedModel';


export class EnumModel extends AbstractedModel<EnumSchema> {

  constructor(
    public readonly name: string,
    protected readonly schema: EnumSchema,
    protected readonly _repository: ModelsRepository
  ) {
    super(name, schema, _repository);
  }


  public get dependencies(): PropertyDependency[] {
    return [];
  }


  protected write(): string {
    switch (this.schema.type) {
      case 'string':
        if (Array.isArray(this.schema.enum)) {
          return [
            `export type ${this.name} =`,
            this.schema.enum.map(name => `  | '${name}'`).join('\n') + ';\n'
          ].join('\n');
        }
        else {
          return `export type ${this.name} = ${this.schema.type};\n`;
        }

      case 'array':
        return `export type ${this.name} = ${this.schema.items.type}[];\n`;

      default:
        return `export type ${this.name} = ${(this.schema as any).type};\n`;
    }
  }

}
