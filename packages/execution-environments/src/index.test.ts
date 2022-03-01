import * as mainExports from '.';

describe('index.ts', () => {
  it('has expected exports', () => {
    expect(Object.keys(mainExports)).toHaveLength(1);
    expect(mainExports.SNAP_STREAM_NAMES).toBeDefined();
  });
});
