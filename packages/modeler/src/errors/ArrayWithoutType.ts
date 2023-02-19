export default class ArrayWithoutType extends Error {

  constructor(propName: string) {
    super(
      `You have decorated the '${propName}' that is an Array type `
      + 'but no valid type has been defined for mapping.'
    );
  }

}
