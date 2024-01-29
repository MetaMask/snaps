import type { NonEmptyArray } from '@metamask/utils';

import type { ChainId } from '../caip';

type BaseOnNameLookupArgs = {
  chainId: ChainId;
};

/**
 * The arguments for a domain lookup.
 *
 * @property domain - The human-readable domain name that is to be resolved.
 */
export type DomainLookupArgs = BaseOnNameLookupArgs & {
  domain: string;
  address?: never;
};

/**
 * The arguments for an address lookup.
 *
 * @property address - The address that is to be resolved.
 */
export type AddressLookupArgs = BaseOnNameLookupArgs & {
  address: string;
  domain?: never;
};

/**
 * The address resolution object.
 *
 * @property protocol - The protocol that resolved the domain.
 * @property resolvedAddress - The resolved address.
 */
export type AddressResolution = {
  protocol: string;
  resolvedAddress: string;
};

/**
 * The domain resolution object.
 *
 * @property protocol - The protocol that resolved the address.
 * @property resolvedDomain - The resolved domain.
 */
export type DomainResolution = {
  protocol: string;
  resolvedDomain: string;
};

/**
 * The result of a domain lookup.
 *
 * @property resolvedAddress - The resolved address.
 */
export type DomainLookupResult = {
  resolvedAddresses: NonEmptyArray<AddressResolution>;
  resolvedDomains?: never;
};

/**
 * The result of an address lookup.
 *
 * @property resolvedDomain - The resolved domain name.
 */
export type AddressLookupResult = {
  resolvedDomains: NonEmptyArray<DomainResolution>;
  resolvedAddresses?: never;
};

/**
 * The `onNameLookup` handler, which is called when MetaMask needs to resolve an
 * address or domain.
 *
 * Note that using this handler requires the `endowment:name-lookup` permission.
 *
 * @param args - The request arguments.
 * @param args.chainId - The CAIP-2 {@link ChainId} of the network the
 * transaction is being submitted to.
 * @param args.domain - The human-readable address that is to be resolved. This
 * is mutually exclusive with `args.address`.
 * @param args.address - The address that is to be resolved. This is mutually
 * exclusive with `args.domain`.
 * @returns The resolved domain or address from the lookup. Must be either
 * {@link AddressLookupResult}, {@link DomainLookupResult}, or `null` if the
 * address or domain could not be resolved.
 */
export type OnNameLookupHandler = (
  args: AddressLookupArgs | DomainLookupArgs,
) => Promise<AddressLookupResult | DomainLookupResult | null>;
