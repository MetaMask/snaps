import { isDerivationPathEqual } from './array';

describe('isDerivationPathEqual', () => {
  it.each([
    ['m/0/1/2', 'm/0/1/2'],
    ['m/0/1/2', 'm/0/01/02'],
    ["m/0'/1/2", "m/00'/01/02"],
    ["m/1'/2'/3'/4/5/6", "m/1'/2'/3'/4/5/6"],
  ])('returns true', (pathA, pathB) => {
    expect(isDerivationPathEqual(pathA.split('/'), pathB.split('/'))).toBe(
      true,
    );
  });

  it.each([
    ['m/0/1/2', 'm/0/1/23'],
    ['m/0/1/2', 'm/0/1/03'],
    ["m/0'/1/2", 'm/0/1/2'],
    ["m/1'/2'/3'/4/5/6", "m/1'/2'/3'/4/5/7"],
  ])('returns false', (pathA, pathB) => {
    expect(isDerivationPathEqual(pathA.split('/'), pathB.split('/'))).toBe(
      false,
    );
  });
});
