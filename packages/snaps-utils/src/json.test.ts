import { getJsonSizeUnsafe, parseJson } from './json';

describe('parseJson', () => {
  it('strips __proto__ and constructor', () => {
    const input =
      '{ "test": { "__proto__": { "foo": "bar" } }, "test2": { "constructor": { "baz": "qux" } } }';
    expect(parseJson(input)).toStrictEqual({ test: {}, test2: {} });
  });
});

describe('getJsonSizeUnsafe', () => {
  it('strips __proto__ and constructor', () => {
    const input = { foo: 'bar' };
    expect(getJsonSizeUnsafe(input)).toBe(13);
  });
});
