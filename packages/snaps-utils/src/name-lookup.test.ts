import { assertIsLookupProtocols } from './name-lookup';

describe('assertIsLookupProtocols', () => {
  it('will not throw for a valid lookup protocols value', () => {
    const test1 = ['lens'];
    const test2 = ['lens', 'ens'];
    expect(() => assertIsLookupProtocols(test1)).not.toThrow();
    expect(() => assertIsLookupProtocols(test2)).not.toThrow();
  });

  it('will throw for a invalid lookup protocols value', () => {
    const test1 = [] as const;
    const test2 = [{}];
    expect(() => assertIsLookupProtocols(test1)).toThrow(
      'Invalid lookup protocols.',
    );
    expect(() => assertIsLookupProtocols(test2)).toThrow(
      'Invalid lookup protocols.',
    );
  });
});
