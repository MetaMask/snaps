// eslint-disable-next-line @typescript-eslint/ban-types
export function isPlainObject(value: unknown): value is Object {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
