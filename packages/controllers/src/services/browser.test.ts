import * as BrowserExport from './browser';

describe('browser entrypoint', () => {
  const expectedExports = [
    'AbstractExecutionService',
    'setupMultiplex',
    'IframeExecutionService',
  ];

  it('entrypoint has expected exports', () => {
    expect(Object.keys(BrowserExport)).toHaveLength(expectedExports.length);

    for (const exportName of expectedExports) {
      expect(exportName in BrowserExport).toStrictEqual(true);
    }
  });
});
