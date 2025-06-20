import type { CaipAssetType } from '@metamask/utils';

import { getPseudoRandomUuidGenerator, getScopesFromAssets } from './accounts';

describe('getPseudoRandomUuidGenerator', () => {
  it('generates unique pseudo-random UUIDs', () => {
    const generateUuid = getPseudoRandomUuidGenerator();
    const uuid1 = generateUuid();
    const uuid2 = generateUuid();

    expect(uuid1).not.toBe(uuid2);
  });

  it('generates UUIDs in the correct format', () => {
    const generateUuid = getPseudoRandomUuidGenerator();
    expect(generateUuid()).toBe('5feceb66-ffc84f38-9952786c-6d696c79');
  });

  it('returns an empty string if bytes.toString("hex") returns an empty string', () => {
    const generator = getPseudoRandomUuidGenerator();

    // Monkey-patch Buffer.prototype.toString to simulate empty string
    const originalToString = Buffer.prototype.toString;
    Buffer.prototype.toString = function () {
      return '';
    };

    try {
      const uuid = generator();
      expect(uuid).toBe('');
    } finally {
      // Restore original method
      Buffer.prototype.toString = originalToString;
    }
  });
});

describe('getScopesFromAssets', () => {
  it('returns unique scopes from a list of assets', () => {
    const assets: CaipAssetType[] = [
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1/slip44:501',
    ];

    const expectedScopes = [
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    ];

    const scopes = getScopesFromAssets(assets);

    expect(scopes).toStrictEqual(expectedScopes);
  });

  it('returns an empty array when no assets are provided', () => {
    const scopes = getScopesFromAssets();
    expect(scopes).toStrictEqual([]);
  });
});
