import { getOptions } from './options';

describe('getOptions', () => {
  it('returns the default options if no options are provided', () => {
    const options = getOptions({});

    expect(options).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0x1234567890abcdef1234567890abcdef12345678",
            "assets": [],
            "id": "29bc7513-d1b9-4466-98a6-f5f9e0b90137",
            "scopes": [
              "eip155:0",
            ],
            "selected": false,
          },
          {
            "address": "7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
            "assets": [
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501",
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            ],
            "id": "e051723c-85d0-43a3-b9bf-568a90d3f378",
            "scopes": [
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
              "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
              "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
            ],
            "selected": true,
          },
        ],
        "assets": {
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501": {
            "name": "Solana",
            "symbol": "SOL",
          },
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
            "name": "USDC",
            "symbol": "USDC",
          },
        },
        "batchCheckBalances": true,
        "currency": "usd",
        "displayNftMedia": true,
        "hideBalances": false,
        "locale": "en",
        "secretRecoveryPhrase": "test test test test test test test test test test test ball",
        "showTestnets": true,
        "simulateOnChainActions": true,
        "state": null,
        "unencryptedState": null,
        "useExternalPricingData": true,
        "useNftDetection": true,
        "useSecurityAlerts": true,
        "useTokenDetection": true,
      }
    `);
  });

  it('returns the provided options', () => {
    const options = getOptions({
      currency: 'eur',
      locale: 'nl',
    });

    expect(options).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0x1234567890abcdef1234567890abcdef12345678",
            "assets": [],
            "id": "29bc7513-d1b9-4466-98a6-f5f9e0b90137",
            "scopes": [
              "eip155:0",
            ],
            "selected": false,
          },
          {
            "address": "7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv",
            "assets": [
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501",
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            ],
            "id": "e051723c-85d0-43a3-b9bf-568a90d3f378",
            "scopes": [
              "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
              "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
              "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
            ],
            "selected": true,
          },
        ],
        "assets": {
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501": {
            "name": "Solana",
            "symbol": "SOL",
          },
          "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
            "name": "USDC",
            "symbol": "USDC",
          },
        },
        "batchCheckBalances": true,
        "currency": "eur",
        "displayNftMedia": true,
        "hideBalances": false,
        "locale": "nl",
        "secretRecoveryPhrase": "test test test test test test test test test test test ball",
        "showTestnets": true,
        "simulateOnChainActions": true,
        "state": null,
        "unencryptedState": null,
        "useExternalPricingData": true,
        "useNftDetection": true,
        "useSecurityAlerts": true,
        "useTokenDetection": true,
      }
    `);
  });

  it('throws if an invalid option is provided', () => {
    expect(() => {
      getOptions({
        // @ts-expect-error Invalid option
        invalidOption: true,
      });
    }).toThrow(
      'At path: invalidOption -- Expected a value of type `never`, but received: `true`',
    );
  });
});
