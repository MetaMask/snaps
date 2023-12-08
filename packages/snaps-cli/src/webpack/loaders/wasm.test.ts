import { stringToBytes } from '@metamask/utils';

import loader, { raw } from './wasm';

describe('loader', () => {
  it('inlines the WASM module as a `Uint8Array`', async () => {
    const source = stringToBytes('WASM module');
    const result = loader(source);

    expect(result).toMatchInlineSnapshot(`
      "
          const bytes = new Uint8Array([87,65,83,77,32,109,111,100,117,108,101]);
          const module = new WebAssembly.Module(bytes);
          const instance = new WebAssembly.Instance(module, {});

          export default instance.exports;
        "
    `);
  });

  describe('raw', () => {
    it('is `true`', () => {
      expect(raw).toBe(true);
    });
  });
});
