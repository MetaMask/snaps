import { getOptions } from './options';

describe('getOptions', () => {
  it('returns the default options if no options are provided', () => {
    const options = getOptions({});

    expect(options).toMatchInlineSnapshot(`
      {
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
