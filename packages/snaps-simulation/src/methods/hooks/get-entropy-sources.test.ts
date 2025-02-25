import { getGetEntropySourcesImplementation } from './get-entropy-sources';

describe('getGetEntropySourcesImplementation', () => {
  it('returns the implementation of the `getEntropySources` hook', async () => {
    const fn = getGetEntropySourcesImplementation();

    expect(fn()).toStrictEqual([
      {
        id: 'entropy-source-1',
        name: 'Entropy Source 1',
        type: 'mnemonic',
        primary: true,
      },
    ]);
  });
});
