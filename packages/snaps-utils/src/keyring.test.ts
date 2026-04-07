import { assertIsKeyringCapabilities } from './keyring';

describe('assertIsKeyringCapabilities', () => {
  it.each([
    {},
    { capabilities: undefined },
    {
      capabilities: {
        scopes: ['eip155:1'],
      },
    },
    {
      capabilities: {
        scopes: ['bip122:000000000019d6689c085ae165831e93'],
        bip44: { derivePath: true },
      },
    },
    {
      capabilities: {
        scopes: ['eip155:1'],
        bip44: {
          derivePath: true,
          deriveIndex: true,
          deriveIndexRange: true,
          discover: true,
        },
      },
    },
    {
      capabilities: {
        scopes: ['bip122:000000000019d6689c085ae165831e93'],
        privateKey: {
          importFormats: [{ encoding: 'base58', type: 'bip122:p2pkh' }],
          exportFormats: [{ encoding: 'hexadecimal' }],
        },
      },
    },
    {
      capabilities: {
        scopes: ['eip155:1'],
        custom: { createAccounts: true },
      },
    },
    {
      capabilities: {
        scopes: ['eip155:1'],
        bip44: {},
        privateKey: {},
        custom: {},
      },
    },
  ])('does not throw for %p', (value) => {
    expect(() => assertIsKeyringCapabilities(value)).not.toThrow();
  });

  it.each([true, false, null, undefined, 0, 1, '', 'foo', ['foo']])(
    'throws for %p',
    (value) => {
      expect(() => assertIsKeyringCapabilities(value)).toThrow(
        'Invalid keyring capabilities',
      );
    },
  );

  it('throws if scopes is empty', () => {
    expect(() =>
      assertIsKeyringCapabilities({
        capabilities: { scopes: [] },
      }),
    ).toThrow('Invalid keyring capabilities');
  });

  it('throws if scopes contains an invalid CAIP chain ID', () => {
    expect(() =>
      assertIsKeyringCapabilities({
        capabilities: { scopes: ['not-a-caip-id'] },
      }),
    ).toThrow('Invalid keyring capabilities');
  });

  it('throws if bip44 fields have non-boolean values', () => {
    expect(() =>
      assertIsKeyringCapabilities({
        capabilities: {
          scopes: ['eip155:1'],
          bip44: { derivePath: 'yes' },
        },
      }),
    ).toThrow('Invalid keyring capabilities');
  });

  it('throws if privateKey encoding is invalid', () => {
    expect(() =>
      assertIsKeyringCapabilities({
        capabilities: {
          scopes: ['eip155:1'],
          privateKey: {
            importFormats: [{ encoding: 'invalid' }],
          },
        },
      }),
    ).toThrow('Invalid keyring capabilities');
  });

  it('throws if importFormats type is invalid', () => {
    expect(() =>
      assertIsKeyringCapabilities({
        capabilities: {
          scopes: ['eip155:1'],
          privateKey: {
            importFormats: [{ encoding: 'base58', type: 'invalid:type' }],
          },
        },
      }),
    ).toThrow('Invalid keyring capabilities');
  });

  it('throws if capabilities has unexpected fields', () => {
    expect(() =>
      assertIsKeyringCapabilities({
        capabilities: {
          scopes: ['eip155:1'],
          unknownField: true,
        },
      }),
    ).toThrow('Invalid keyring capabilities');
  });

  it('uses the provided error wrapper', () => {
    const ErrorWrapper = ({ message }: { message: string }) =>
      new Error(message);

    expect(() => assertIsKeyringCapabilities(true, ErrorWrapper)).toThrow(
      'Invalid keyring capabilities',
    );
  });
});
