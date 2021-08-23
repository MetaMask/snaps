export function isPlainObject(
  value: unknown,
): value is Record<number | string | symbol, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
