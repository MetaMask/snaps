import {
  ConnectArguments,
  NamespaceId,
  SnapId,
  Namespace,
} from '@metamask/snap-utils';

/**
 * Finds a keyring snap for each namespace implements at a minimum the requested functionality.
 *
 * @param requestedNamespaces - The requested namespaces.
 * @param snaps - All snaps and their exposed keyring namespaces.
 * @returns A mapping between namespaces and snap ids.
 */
export function findMatchingKeyringSnaps(
  requestedNamespaces: ConnectArguments['requiredNamespaces'],
  snaps: Record<SnapId, Record<NamespaceId, Namespace> | null>,
): Record<NamespaceId, SnapId[]> {
  const snapEntries = Object.entries(snaps);
  return Object.entries(requestedNamespaces).reduce<
    Record<NamespaceId, SnapId[]>
  >((acc, [requestedNamespaceId, currentRequestedNamespace]) => {
    const matchedSnaps = snapEntries
      .filter(([, namespaces]) => {
        const potentialMatch = namespaces?.[requestedNamespaceId];
        return (
          potentialMatch !== undefined &&
          matchNamespace(currentRequestedNamespace, potentialMatch)
        );
      })
      .map(([snapId]) => snapId);
    acc[requestedNamespaceId] = matchedSnaps;
    return acc;
  }, {});
}

/**
 * Determines whether a keyring namespace is a match given a potential match and the requested namespace.
 *
 * This function assumes that the namespace ID has already been matched.
 *
 * @param requestedNamespace - The requested namespace information.
 * @param potentialMatchNamespace - The potential match.
 * @returns True if the potentially matching namespace is a match.
 */
function matchNamespace(
  requestedNamespace: ConnectArguments['requiredNamespaces'][NamespaceId],
  potentialMatchNamespace: Namespace,
) {
  if (
    !requestedNamespace.chains.every((requestedChain) =>
      potentialMatchNamespace.chains.some(
        (potentialMatchChain) => potentialMatchChain.id === requestedChain,
      ),
    )
  ) {
    return false;
  }

  if (
    !isSubset(
      requestedNamespace.events ?? [],
      potentialMatchNamespace.events ?? [],
    )
  ) {
    return false;
  }

  if (
    !isSubset(
      requestedNamespace.methods ?? [],
      potentialMatchNamespace.methods ?? [],
    )
  ) {
    return false;
  }

  return true;
}

/**
 * Determines whether an array is a subset of another array.
 *
 * @param potentialSubset - The potential subset.
 * @param array - The other array.
 * @returns True if the first argument is a subset of second argument.
 */
function isSubset<T>(potentialSubset: T[], array: T[]) {
  return potentialSubset.every((item) => array.includes(item));
}
