import loader from './wasm';

describe('loader', () => {
  it('inlines the WASM module as a `Uint8Array`', async () => {
    const source = 'WASM module';
    const result = loader(source);

    expect(result).toMatchInlineSnapshot(
      `"export default new Uint8Array([87,65,83,77,32,109,111,100,117,108,101]);"`,
    );
  });
});
