import { ConnectArguments, NamespaceId, SnapId, Namespace } from '@metamask/snap-utils';
/**
 * Finds a keyring snap for each namespace implements at a minimum the requested functionality.
 *
 * @param requestedNamespaces - The requested namespaces.
 * @param snaps - All snaps and their exposed keyring namespaces.
 * @returns A mapping between namespaces and snap ids.
 */
export declare function findMatchingKeyringSnaps(requestedNamespaces: ConnectArguments['requiredNamespaces'], snaps: Record<SnapId, Record<NamespaceId, Namespace> | null>): Record<NamespaceId, SnapId[]>;
