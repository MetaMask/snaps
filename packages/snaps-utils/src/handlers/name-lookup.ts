import {
  array,
  nullable,
  object,
  size,
  string,
  union,
} from '@metamask/superstruct';

export const AddressResolutionStruct = object({
  protocol: string(),
  resolvedDomain: string(),
});

export const DomainResolutionStruct = object({
  protocol: string(),
  resolvedAddress: string(),
  domainName: string(),
});

export const AddressResolutionResponseStruct = object({
  resolvedDomains: size(array(AddressResolutionStruct), 1, Infinity),
});

export const DomainResolutionResponseStruct = object({
  resolvedAddresses: size(array(DomainResolutionStruct), 1, Infinity),
});

export const OnNameLookupResponseStruct = nullable(
  union([AddressResolutionResponseStruct, DomainResolutionResponseStruct]),
);
