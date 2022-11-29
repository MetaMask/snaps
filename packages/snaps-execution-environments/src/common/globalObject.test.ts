import { rootRealmGlobal, rootRealmGlobalName } from './globalObject';

describe('globalObject', () => {
  it('has the expected values', () => {
    expect(rootRealmGlobal).toStrictEqual(globalThis);
    expect(rootRealmGlobalName).toBe('globalThis');
  });
});
