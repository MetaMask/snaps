/**
 * Get the implementation of the `getEntropySources` hook.
 *
 * @returns The implementation of the `getEntropySources` hook. Right now, it
 * only returns a single hard coded entropy source. In the future, it could
 * return a configurable list of entropy sources.
 */
export function getGetEntropySourcesImplementation() {
  return () => {
    return [
      {
        id: 'default',
        name: 'Default Secret Recovery Phrase',
        type: 'mnemonic' as const,
        primary: true,
      },
      {
        id: 'alternative',
        name: 'Alternative Secret Recovery Phrase',
        type: 'mnemonic' as const,
        primary: false,
      },
    ];
  };
}
