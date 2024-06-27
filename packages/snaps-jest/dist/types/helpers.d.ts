import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import type { InstallSnapOptions } from './internals';
import type { Snap } from './types';
/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export declare function installSnap(): Promise<Snap>;
/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export declare function installSnap<Service extends new (...args: any[]) => InstanceType<typeof AbstractExecutionService>>(options: Partial<InstallSnapOptions<Service>>): Promise<Snap>;
/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param snapId - The ID of the snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM snap IDs.
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export declare function installSnap<Service extends new (...args: any[]) => InstanceType<typeof AbstractExecutionService>>(snapId: SnapId, options?: Partial<InstallSnapOptions<Service>>): Promise<Snap>;
