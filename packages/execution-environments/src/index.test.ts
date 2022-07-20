import * as mainExports from '.';

describe('index.ts', () => {
  it('has expected exports', () => {
    expect(Object.keys(mainExports)).toHaveLength(2);
    expect(mainExports.SNAP_STREAM_NAMES).toBeDefined();
    expect(mainExports.HandlerType).toBeDefined();
  });
});
