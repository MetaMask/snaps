"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatchingKeyringSnaps = void 0;
/**
 * Finds a keyring snap for each namespace implements at a minimum the requested functionality.
 *
 * @param requestedNamespaces - The requested namespaces.
 * @param snaps - All snaps and their exposed keyring namespaces.
 * @returns A mapping between namespaces and snap ids.
 */
function findMatchingKeyringSnaps(requestedNamespaces, snaps) {
    const snapEntries = Object.entries(snaps);
    return Object.entries(requestedNamespaces).reduce((acc, [requestedNamespaceId, currentRequestedNamespace]) => {
        const matchedSnaps = snapEntries
            .filter(([, namespaces]) => {
            const potentialMatch = namespaces === null || namespaces === void 0 ? void 0 : namespaces[requestedNamespaceId];
            return (potentialMatch !== undefined &&
                matchNamespace(currentRequestedNamespace, potentialMatch));
        })
            .map(([snapId]) => snapId);
        acc[requestedNamespaceId] = matchedSnaps;
        return acc;
    }, {});
}
exports.findMatchingKeyringSnaps = findMatchingKeyringSnaps;
/**
 * Determines whether a keyring namespace is a match given a potential match and the requested namespace.
 *
 * This function assumes that the namespace ID has already been matched.
 *
 * @param requestedNamespace - The requested namespace information.
 * @param potentialMatchNamespace - The potential match.
 * @returns True if the potentially matching namespace is a match.
 */
function matchNamespace(requestedNamespace, potentialMatchNamespace) {
    var _a, _b, _c, _d;
    if (!requestedNamespace.chains.every((requestedChain) => potentialMatchNamespace.chains.some((potentialMatchChain) => potentialMatchChain.id === requestedChain))) {
        return false;
    }
    if (!isSubset((_a = requestedNamespace.events) !== null && _a !== void 0 ? _a : [], (_b = potentialMatchNamespace.events) !== null && _b !== void 0 ? _b : [])) {
        return false;
    }
    if (!isSubset((_c = requestedNamespace.methods) !== null && _c !== void 0 ? _c : [], (_d = potentialMatchNamespace.methods) !== null && _d !== void 0 ? _d : [])) {
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
function isSubset(potentialSubset, array) {
    return potentialSubset.every((item) => array.includes(item));
}
//# sourceMappingURL=matching.js.map