export default class InvalidPropMetadata extends Error {

  constructor(property: string) {
    super(`Metadata for ${property} doesn't exists`);
  }

}
