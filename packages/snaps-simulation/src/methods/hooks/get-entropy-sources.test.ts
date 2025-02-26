import { getGetEntropySourcesImplementation } from './get-entropy-sources';

describe('getGetEntropySourcesImplementation', () => {
  it('returns the implementation of the `getEntropySources` hook', async () => {
    const fn = getGetEntropySourcesImplementation();

    expect(fn()).toStrictEqual([
      {
        id: 'default',
        name: 'Default Secret Recovery Phrase',
        type: 'mnemonic',
        primary: true,
      },
      {
        id: 'alternative',
        name: 'Alternative Secret Recovery Phrase',
        type: 'mnemonic',
        primary: false,
      },
    ]);
  });
});
