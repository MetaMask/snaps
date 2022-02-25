import * as mainExports from '.';

// Dummy test for coverage purposes.
describe('index.ts', () => {
  it('has expected exports', () => {
    expect(mainExports.SNAP_STREAM_NAMES).toBeDefined();
  });
});
