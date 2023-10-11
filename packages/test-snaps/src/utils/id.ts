import { assert } from '@metamask/utils';

/**
 * Get the actual Snap ID to use, for a given NPM Snap ID and port.
 *
 * If the current environment is production, the NPM Snap ID is used. Otherwise,
 * the local ID, based on the port, is used.
 *
 * @param snapId - The NPM Snap ID, if any.
 * @param port - The port to use for the local ID, if any.
 * @returns The Snap ID to use.
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
