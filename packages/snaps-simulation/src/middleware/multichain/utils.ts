import type {
  Caip25CaveatValue,
  InternalScopeObject,
} from '@metamask/chain-agnostic-permission';
import { getSessionScopes as getMergedSessionScopes } from '@metamask/chain-agnostic-permission';
import type { CaipChainId } from '@metamask/utils';

/**
 * Get a session scopes value that can be used for simulation, by injecting non-EVM methods into the returned session scopes
 * directly from the caveat.
 *
 * @param value The caveat value.
 * @returns The session scopes.
 */
export function getSessionScopes(value: Caip25CaveatValue) {
  const mergedScopes = {
    ...value.requiredScopes,
    ...value.optionalScopes,
  } as Record<CaipChainId, InternalScopeObject & { methods: string[] }>;
  const nonEvmMethods = Object.keys(mergedScopes).reduce<
    Record<CaipChainId, string[]>
  >((accumulator, scope) => {
    const castScope = scope as CaipChainId | 'wallet';
    if (!castScope.startsWith('eip155') && castScope !== 'wallet') {
      accumulator[castScope] = mergedScopes[castScope].methods;
    }
    return accumulator;
  }, {});

  return getMergedSessionScopes(value, {
    getNonEvmSupportedMethods: (scope) => nonEvmMethods[scope] ?? [],
  });
}
