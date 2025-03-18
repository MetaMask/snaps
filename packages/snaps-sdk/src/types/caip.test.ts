import { is } from '@metamask/superstruct';

import {
  NonEip155AssetTypeStruct,
  NonEip155ChainIdStruct,
  NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct,
} from './caip';

describe('NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct', () => {
  it('validates an array of matching non EIP-155 namespace addresses', () => {
    expect(
      is(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct,
      ),
    ).toBe(true);
  });

  it("doesn't validate an array of matching addresses with an EIP-155 namespace", () => {
    expect(
      is(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          'eip155:1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ],
        NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct,
      ),
    ).toBe(false);
  });

  it("doesn't validate an array of mismatching addresses", () => {
    expect(
      is(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:3PWWwUkCPALDXBcwQBRTYiob2C6xfCm35kzuoJr7ubuw',
        ],
        NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct,
      ),
    ).toBe(false);
  });

  it("doesn't validate an array of mismatching chain namespaces", () => {
    expect(
      is(
        [
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          'foo:3:0x1234567890123456789012345678901234567890',
        ],
        NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct,
      ),
    ).toBe(false);
  });
});

describe('NonEip155ChainIdStruct', () => {
  it('validates a non EIP-155 chain ID', () => {
    expect(
      is('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', NonEip155ChainIdStruct),
    ).toBe(true);
  });

  it("doesn't validate an EIP-155 chain ID", () => {
    expect(is('eip155:1', NonEip155ChainIdStruct)).toBe(false);
  });
});

describe('NonEip155AssetTypeStruct', () => {
  it('validates a non EIP-155 asset type', () => {
    expect(
      is(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        NonEip155AssetTypeStruct,
      ),
    ).toBe(true);
  });

  it("doesn't validate an EIP-155 asset type", () => {
    expect(is('eip155:1/slip44:60', NonEip155AssetTypeStruct)).toBe(false);
  });
});
