import assert from 'assert';

import { unusedExports } from './unused-exports';
import { getMockSnapFiles, getSnapManifest } from '../../test-utils';

describe('unusedExports', () => {
  it('does nothing if `exports` or `handlerEndowments` are not provided', async () => {
    const report = jest.fn();
    assert(unusedExports.semanticCheck);

    await unusedExports.semanticCheck(
      getMockSnapFiles({
        manifest: getSnapManifest(),
        manifestPath: __filename,
      }),
      { report },
    );

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if the manifest contains an endowment which is not used by the Snap', async () => {
    const report = jest.fn();
    assert(unusedExports.semanticCheck);

    const files = getMockSnapFiles({
      manifest: getSnapManifest({
        initialPermissions: {
          'endowment:page-home': {},
        },
      }),
      manifestPath: __filename,
    });

    await unusedExports.semanticCheck(files, {
      report,
      options: {
        exports: [],
        handlerEndowments: {
          onRpcRequest: 'endowment:rpc',
          onHomePage: 'endowment:page-home',
          onUserInput: null,
        },
      },
    });

    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(
      'unused-endowments',
      expect.stringContaining(
        `The Snap requests permission for the following handlers, but does not export them: onHomePage (endowment:page-home).`,
      ),
      expect.any(Function),
    );

    const fix = report.mock.calls[0][2];
    assert(fix);

    const { manifest } = await fix({ manifest: files.manifest.result });
    expect(manifest.initialPermissions).toStrictEqual({});
  });

  it('reports if the Snap exports a handler but does not request permission for it in the manifest', async () => {
    const report = jest.fn();
    assert(unusedExports.semanticCheck);

    const files = getMockSnapFiles({
      manifest: getSnapManifest({
        initialPermissions: {
          'endowment:page-home': {},
        },
      }),
      manifestPath: __filename,
    });

    await unusedExports.semanticCheck(files, {
      report,
      options: {
        exports: ['onRpcRequest', 'onHomePage'],
        handlerEndowments: {
          onRpcRequest: 'endowment:rpc',
          onHomePage: 'endowment:page-home',
          onUserInput: null,
        },
      },
    });

    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(
      'unused-exports',
      expect.stringContaining(
        'The Snap exports the following handlers, but does not request permission for them: onRpcRequest (endowment:rpc).',
      ),
    );
  });

  it('does not report if the Snap exports a handler and requests permission for it in the manifest', async () => {
    const report = jest.fn();
    assert(unusedExports.semanticCheck);

    const files = getMockSnapFiles({
      manifest: getSnapManifest({
        initialPermissions: {
          'endowment:page-home': {},
          'endowment:rpc': {},
          'endowment:lifecycle-hooks': {},
        },
      }),
      manifestPath: __filename,
    });

    await unusedExports.semanticCheck(files, {
      report,
      options: {
        exports: ['onRpcRequest', 'onHomePage', 'onInstall'],
        handlerEndowments: {
          onRpcRequest: 'endowment:rpc',
          onHomePage: 'endowment:page-home',
          onInstall: 'endowment:lifecycle-hooks',
          onUpdate: 'endowment:lifecycle-hooks',
          onUserInput: null,
        },
      },
    });

    expect(report).toHaveBeenCalledTimes(0);
  });
});
