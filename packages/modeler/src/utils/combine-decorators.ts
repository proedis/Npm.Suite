export function combineDecorators(...decorators: PropertyDecorator[]): PropertyDecorator {
  return function combinedDecorator(target, propertyKey) {
    decorators.forEach((decorator) => decorator(target, propertyKey));
  };
}
