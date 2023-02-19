export default class InvalidPropertyConstructor extends Error {

  constructor(property: string) {
    super(`Could not find a default constructor for property '${property}'`);
  }

}
