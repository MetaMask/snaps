import { parseJson } from './json';

describe('parseJson', () => {
  it('strips __proto__ and constructor', () => {
    const input =
      '{ "test": { "__proto__": { "foo": "bar" } }, "test2": { "constructor": { "baz": "qux" } } }';
    expect(parseJson(input)).toStrictEqual({ test: {}, test2: {} });
  });
});
