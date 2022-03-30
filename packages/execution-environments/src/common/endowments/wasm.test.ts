import wasm, { excludedProperties } from './wasm';

describe('createWASM', () => {
  it('has expected properties', () => {
    expect(wasm).toMatchObject({
      names: ['WebAssembly'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    const factoryOutput = wasm.factory();
    const enumerableKeys = Object.keys(factoryOutput.WebAssembly);
    const allKeys = Reflect.ownKeys(factoryOutput.WebAssembly);

    expect(factoryOutput).toMatchObject({ WebAssembly: expect.any(Object) });
    expect(enumerableKeys).toStrictEqual(
      Object.keys(WebAssembly).filter(
        (key) => !excludedProperties.includes(key),
      ),
    );

    expect(allKeys).toStrictEqual(
      Reflect.ownKeys(WebAssembly).filter(
        (key) => !excludedProperties.includes(key),
      ),
    );
    expect(allKeys.length).toBeGreaterThan(enumerableKeys.length);
  });
});
