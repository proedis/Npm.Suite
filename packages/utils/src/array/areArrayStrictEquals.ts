type ArrayLike = unknown[] | null | undefined;

export function areArrayStrictEquals(first: ArrayLike, second: ArrayLike): boolean {
  /** Strict check if they are equals */
  if (first === second) {
    return true;
  }

  /** Assert both are arrays */
  if (!Array.isArray(first) || !Array.isArray(second)) {
    return false;
  }

  /** Use the Json Stringify method to compare string */
  return JSON.stringify(first) === JSON.stringify(second);
}
