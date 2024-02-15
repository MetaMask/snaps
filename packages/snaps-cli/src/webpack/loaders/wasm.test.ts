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

          const bytes = new Uint8Array([0,97,115,109,1,0,0,0,1,12,2,96,2,127,127,1,127,96,1,127,1,127,2,26,1,18,46,46,47,115,114,99,47,98,105,110,100,105,110,103,115,46,116,115,3,97,100,100,0,0,3,2,1,1,5,3,1,0,0,7,22,2,9,102,105,98,111,110,97,99,99,105,0,1,6,109,101,109,111,114,121,2,0,10,54,1,52,1,3,127,65,1,33,1,32,0,65,0,74,4,64,3,64,32,0,65,1,107,34,0,4,64,32,2,32,1,16,0,33,3,32,1,33,2,32,3,33,1,12,1,11,11,32,1,15,11,65,0,11]);
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
