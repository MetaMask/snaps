import { assert } from '@metamask/utils';

/**
 * Get the actual snap ID to use, for a given NPM snap ID and port.
 *
 * If the current environment is production, the NPM snap ID is used. Otherwise,
 * the local ID, based on the port, is used.
 *
 * @param snapId - The NPM snap ID, if any.
 * @param port - The port to use for the local ID, if any.
 * @returns The snap ID to use.
 */
export function getSnapId(
  snapId: `npm:${string}` | undefined,
  port: number | undefined,
) {
  assert(snapId ?? port);

  if (!port) {
    return snapId as string;
  }

  const localId = `local:http://localhost:${port}`;
  if (!snapId) {
    return localId;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? snapId : localId;
}
