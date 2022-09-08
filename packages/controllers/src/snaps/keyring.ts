// TODO
export interface Namespace {
  chains: { id: string; name: string }[];
  methods?: string[];
  events?: string[];
}

/**
 * Finds a keyring snap for each namespace implements at a minimum the requested functionality.
 *
 * @param requestedNamespaces - The requested namespaces.
 * @param snaps - All snaps and their exposed keyring namespaces.
 * @returns A mapping between namespaces and snap ids.
 */
export function findMatchingKeyringSnaps(
  requestedNamespaces: Record<string, Namespace>,
  snaps: Record<string, Record<string, Namespace>>,
) {
  const snapEntries = Object.entries(snaps);
  return Object.entries(requestedNamespaces).reduce(
    (acc, [requestedNamespaceId, currentRequestedNamespace]) => {
      const matchedSnap = snapEntries.find(([_, namespaces]) => {
        const potentialMatch = namespaces[requestedNamespaceId];
        return (
          potentialMatch &&
          matchNamespace(currentRequestedNamespace, potentialMatch)
        );
      });
      return { ...acc, [requestedNamespaceId]: matchedSnap?.[0] ?? null };
    },
    {},
  );
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
  requestedNamespace: Namespace,
  potentialMatchNamespace: Namespace,
) {
  // TODO: Determine if those types are actually identical for requested and potential match.
  if (
    !requestedNamespace.chains.every((requestedChain) =>
      potentialMatchNamespace.chains.some(
        (potentialMatchChain) => potentialMatchChain.id === requestedChain.id,
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
function isSubset(potentialSubset: string[], array: string[]) {
  return potentialSubset.every((item) => array.includes(item));
}
