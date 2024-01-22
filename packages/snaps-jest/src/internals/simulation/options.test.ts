import { getOptions } from './options';

describe('getOptions', () => {
  it('returns the default options if no options are provided', () => {
    const options = getOptions({});

    expect(options).toMatchInlineSnapshot(`
      {
        "locale": "en",
        "secretRecoveryPhrase": "test test test test test test test test test test test ball",
        "state": null,
        "unencryptedState": null,
      }
    `);
  });

  it('returns the provided options', () => {
    const options = getOptions({
      locale: 'nl',
    });

    expect(options).toMatchInlineSnapshot(`
      {
        "locale": "nl",
        "secretRecoveryPhrase": "test test test test test test test test test test test ball",
        "state": null,
        "unencryptedState": null,
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
