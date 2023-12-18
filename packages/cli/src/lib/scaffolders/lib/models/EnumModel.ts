import type { EnumSchema, PropertyDependency } from '../../types/openapi';

import { type ModelsRepository } from './ModelsRepository';

import { AbstractedModel } from './AbstractedModel';


export class EnumModel extends AbstractedModel<EnumSchema> {

  constructor(
    protected readonly schema: EnumSchema,
    protected readonly _repository: ModelsRepository
  ) {
    super(schema, _repository);
  }


  public get dependencies(): PropertyDependency[] {
    return [];
  }


  protected write(): string {
    return [
      `export type ${this.name} =`,
      this.schema.enum.map(name => `  | '${name}'`).join('\n') + ';\n'
    ].join('\n');
  }

}