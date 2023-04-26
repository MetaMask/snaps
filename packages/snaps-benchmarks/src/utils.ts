/**
 * Find the first element in an array that matches a condition.
 *
 * @param array - The array to search.
 * @param callback - The callback to call for each element.
 * @returns The first element that matches the condition, or undefined if none
 * match.
 */
export async function findAsync<Type>(
  array: Type[],
  callback: (element: Type) => Promise<boolean>,
): Promise<Type | undefined> {
  const promises = array.map(callback);
  const results = await Promise.all(promises);
  const index = results.findIndex((result) => result);
  return array[index];
}
