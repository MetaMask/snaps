import { rootRealmGlobal } from '../globalObject';
import math from './math';

describe('Math endowment', () => {
  it('has expected properties', () => {
    expect(math).toMatchObject({
      names: ['Math'],
      factory: expect.any(Function),
    });
  });

  it('returns Math from rootRealmGlobal', () => {
    const { Math } = math.factory();
    expect(Math.abs).toStrictEqual(rootRealmGlobal.Math.abs);
  });

  it('throws when Math.random is called', () => {
    const { Math } = math.factory();
    expect(() => Math.random()).toThrow(
      '`Math.random` is not supported. Use `crypto.getRandomValues` instead.',
    );
  });
});
