import * as BrowserExport from './browser';

describe('browser entrypoint', () => {
  const expectedExports = [
    'ExecutionService',
    'setupMultiplex',
    'IframeExecutionService',
    'OffscreenExecutionService',
    'ProxyPostMessageStream',
    'WebViewExecutionService',
    'WebViewMessageStream',
  ];

  it('entrypoint has expected exports', () => {
    expect(Object.keys(BrowserExport)).toHaveLength(expectedExports.length);

    for (const exportName of expectedExports) {
      expect(exportName in BrowserExport).toBe(true);
    }
  });
});
