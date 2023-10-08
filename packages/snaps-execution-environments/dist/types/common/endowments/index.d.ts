import type { StreamProvider } from '@metamask/providers';
import type { SnapsGlobalObject } from '@metamask/rpc-methods';
import type { SnapId } from '@metamask/snaps-utils';
/**
 * Gets the endowments for a particular Snap. Some endowments, like `setTimeout`
 * and `clearTimeout`, must be attenuated so that they can only affect behavior
 * within the Snap's own realm. Therefore, we use factory functions to create
 * such attenuated / modified endowments. Otherwise, the value that's on the
 * root realm global will be used.
 *
 * @param snap - The Snaps global API object.
 * @param ethereum - The Snap's EIP-1193 provider object.
 * @param snapId - The id of the snap that will use the created endowments.
 * @param endowments - The list of endowments to provide to the snap.
 * @returns An object containing the Snap's endowments.
 */
export declare function createEndowments(snap: SnapsGlobalObject, ethereum: StreamProvider, snapId: SnapId, endowments?: string[]): {
    endowments: Record<string, unknown>;
    teardown: () => Promise<void>;
};
