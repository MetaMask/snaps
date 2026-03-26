import ObjectMultiplex from '@metamask/object-multiplex';
import { logError } from '@metamask/snaps-utils';
import type { Duplex } from 'readable-stream';
import { pipeline } from 'readable-stream';

/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param connectionStream - The stream to mux.
 * @param streamName - The name of the stream, for identification in errors.
 * @returns The multiplexed stream.
 */
export function setupMultiplex(
  connectionStream: Duplex,
  streamName: string,
): ObjectMultiplex {
  const mux = new ObjectMultiplex();
  pipeline(connectionStream, mux, connectionStream, (error) => {
    if (error && !error.message?.match('Premature close')) {
      logError(`"${streamName}" stream failure.`, error);
    }
  });
  return mux;
}
