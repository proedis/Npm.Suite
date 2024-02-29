import type { ItemType, PropertyDependency, PropertySchema } from '../../../types/openapi';


/* --------
 * Class Definition
 * -------- */
export abstract class AbstractedProperty<Schema extends ItemType> {


  // ----
  // Static Utilities
  // ----
  public static getUnderlyingType(definition: PropertySchema): ItemType {
    if (definition.type === 'array') {
      if ('x-api-enum' in definition && !!definition['x-api-enum']) {
        return {
          ...definition,
          type: 'string'
        };
      }
      else {
        return this.getUnderlyingType(definition.items as PropertySchema);
      }
    }

    return definition;
  }


  // ----
  // Constructor
  // ----
  public constructor(
    public readonly objectName: string,
    public readonly propertyName: string,
    private readonly definition: PropertySchema
  ) {
    this.schema = AbstractedProperty.getUnderlyingType(definition) as Schema;
  }


  // ----
  // Private fields
  // ----
  protected readonly schema: Schema;


  // ----
  // Utilities
  // ----

  /**
   * Determines whether the schema is nullable.
   *
   * @returns {boolean} True if the schema is nullable, otherwise false.
   */
  public get isNullable(): boolean {
    return this.definition.nullable === true;
  }


  /**
   * Check if the current definition represents an array.
   *
   * @returns {boolean} true if the definition represents an array; otherwise, false.
   */
  public get isArray(): boolean {
    if ('x-api-enum' in this.definition) {
      return this.definition.type !== 'string' && !this.definition['x-enum-as-flags'];
    }

    return this.definition.type === 'array';
  }


  /**
   * Checks if the current array definition is a nested array.
   *
   * @returns {boolean} Returns true if the definition is a nested array, otherwise false.
   */
  public get isNestedArray(): boolean {
    return this.definition.type === 'array' && (this.definition.items as PropertySchema).type === 'array';
  }


  public get requirements(): string {
    return this.isArray && !this.isNullable ? '' : '!';
  }


  // ----
  // Abstracted Methods
  // ----
  abstract get dependencies(): PropertyDependency[];


  abstract get decorators(): string[];


  abstract get propertyType(): string;


  // ----
  // Property Render
  // ----

  private getDescription(indent = 0): string | null {
    if (!this.definition.description) {
      return null;
    }

    return [
      '/**',
      ...this.definition.description.split('\r\n').map(l => ` * ${l}`),
      ' */'
    ].map(l => ' '.repeat(indent) + l).join('\n');
  }


  private get safePropertyType(): string {
    /** Get the base object referenced name */
    const referenceObjectName = this.propertyType;

    /**
     * Must check if the object is self referenced,
     * to avoid circular property reference in self referenced objects.
     * If so, use the Omit type to exclude child property from the referenced type
     */
    return this.objectName === referenceObjectName
      ? `Omit<${referenceObjectName}, '${this.propertyName}'>`
      : referenceObjectName;
  }


  private getPropertyType(): string {
    /** Create the base property type, adding brackets if is an Array */
    const basePropertyType = this.isNestedArray ? `${this.safePropertyType}[][]`
      : this.isArray ? `${this.safePropertyType}[]`
        : this.safePropertyType;

    /** Return the right requirements based on nullable check */
    return this.isNullable ? `Nullable<${basePropertyType}>` : basePropertyType;
  }


  /**
   * Returns the default value for the property.
   *
   * @return {string} The default value for the property.
   */
  protected get propertyDefault(): string {
    const arrayItemType = this.isNestedArray ? `${this.safePropertyType}[]` : this.safePropertyType;
    return this.isArray && !this.isNullable ? ` = new Array<${arrayItemType}>()` : '';
  }


  /**
   * Renders the property in a specific format.
   *
   * @return {string} - The rendered property.
   */
  public renderProperty(indent: number = 0): string {
    return [
      this.getDescription(indent),
      this.decorators.map((d) => ' '.repeat(indent) + d).join('\n'),
      ' '.repeat(indent) + `public ${this.propertyName}${this.requirements}: ${this.getPropertyType()}${this.propertyDefault};`
    ].filter(Boolean).join('\n');
  }

}
