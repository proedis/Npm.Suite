export default async function will<T, K = any>(tester: Promise<T>): Promise<[ K | null, T ]> {
  try {
    const result = await tester;
    return [ null, result ];
  }
  catch (e: any) {
    return [ e, null as unknown as T ];
  }
}
