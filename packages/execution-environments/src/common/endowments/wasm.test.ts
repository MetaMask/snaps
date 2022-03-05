import wasm from './wasm';

describe('createWASM', () => {
  it('has expected properties', () => {
    expect(wasm).toMatchObject({
      names: ['WebAssembly'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    const factoryOutput = wasm.factory();

    expect(factoryOutput).toMatchObject({ WebAssembly: expect.any(Object) });
    expect(Object.keys(factoryOutput)).not.toContain([
      'compileStreaming',
      'instantiateStreaming',
    ]);
  });
});
