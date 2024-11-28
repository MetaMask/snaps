import { readFile } from 'fs/promises';
import { join } from 'path';

import loader, { getExports, getImports, getModuleImports, raw } from './wasm';

describe('getImports', () => {
  it('returns the imports code for the WASM module', () => {
    const result = getImports({
      '../src/bindings.ts': ['add', 'subtract'],
      './foo.ts': ['bar'],
    });

    expect(result).toMatchInlineSnapshot(`
      "import { add, subtract } from "../src/bindings.ts";
      import { bar } from "./foo.ts";"
    `);
  });
});

describe('getModuleImports', () => {
  it('returns the imports code for the WASM module', () => {
    const result = getModuleImports({
      '../src/bindings.ts': ['add', 'subtract'],
      './foo.ts': ['bar'],
    });

    expect(result).toMatchInlineSnapshot(`
      ""../src/bindings.ts": { add, subtract },
      "./foo.ts": { bar },"
    `);
  });
});

describe('getExports', () => {
  it('returns the exports code for the WASM module', () => {
    const result = getExports([
      {
        kind: 'function',
        name: 'fibonacci',
      },
      {
        kind: 'memory',
        name: 'memory',
      },
      {
        kind: 'function',
        name: 'default',
      },
    ]);

    expect(result).toMatchInlineSnapshot(`
      "export const fibonacci = exports["fibonacci"];
      export const memory = exports["memory"];
      export default exports["default"];"
    `);
  });
});

describe('loader', () => {
  it('synchronously initialises the WASM module', async () => {
    const source = await readFile(
      join(__dirname, '__fixtures__', 'program.wasm'),
    );

    // @ts-expect-error - We don't need to mock the entire `this` object.
    const result = await loader.bind({
      addDependency: jest.fn(),
      resourcePath: join(__dirname, '__fixtures__', 'program.wasm'),
      // @ts-expect-error - The type of this function seems to be incorrect.
    })(source);

    expect(result).toMatchInlineSnapshot(`
      "
          import { add } from "../src/bindings.ts";

          const b64 = "AGFzbQEAAAABDAJgAn9/AX9gAX8BfwIaARIuLi9zcmMvYmluZGluZ3MudHMDYWRkAAADAgEBBQMBAAAHFgIJZmlib25hY2NpAAEGbWVtb3J5AgAKNgE0AQN/QQEhASAAQQBKBEADQCAAQQFrIgAEQCACIAEQACEDIAEhAiADIQEMAQsLIAEPC0EACw==";

          function decode(encoded) {
            const str = atob(encoded);
            const bytes = new Uint8Array(str.length);
            for (let i = 0; i < str.length; i++) {
              bytes[i] = str.charCodeAt(i);
            }
            return bytes;
          }

          const bytes = decode(b64);
          const module = new WebAssembly.Module(bytes);
          const instance = new WebAssembly.Instance(module, {
            "../src/bindings.ts": { add },
          });

          const exports = instance.exports;
          export const fibonacci = exports["fibonacci"];
      export const memory = exports["memory"];
        "
    `);
  });

  describe('raw', () => {
    it('is `true`', () => {
      expect(raw).toBe(true);
    });
  });
});
