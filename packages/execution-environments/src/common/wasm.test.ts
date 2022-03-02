import { createWASM } from './wasm';

describe('createWASM', () => {
  it('removes stream functions', () => {
    const result = createWASM();
    expect(Object.keys(result)).not.toContain([
      'compileStreaming',
      'instantiateStreaming',
    ]);
  });
});
