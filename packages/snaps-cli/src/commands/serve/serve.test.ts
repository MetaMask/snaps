import { getMockConfig } from '@metamask/snaps-cli/test-utils';

import * as webpack from '../../webpack';
import { serveHandler } from './serve';

jest.mock('../../webpack');

describe('serveHandler', () => {
  it('starts a server', async () => {
    const config = getMockConfig('webpack', {
      input: '/input.js',
      server: {
        root: '/foo',
        port: 1234,
      },
    });

    const listen = jest.fn().mockReturnValue({ port: config.server.port });
    const log = jest.spyOn(console, 'log').mockImplementation();
    const getServer = jest
      .spyOn(webpack, 'getServer')
      .mockImplementation(() => ({
        listen,
      }));

    await serveHandler(config);

    expect(process.exitCode).not.toBe(1);
    expect(getServer).toHaveBeenCalledWith(config.server.root);
    expect(listen).toHaveBeenCalledWith(config.server.port);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(
        `The server is listening on http://localhost:${config.server.port}.`,
      ),
    );
  });

  it('starts a server when using Browserify', async () => {
    const config = getMockConfig('browserify', {
      cliOptions: {
        root: '/foo/browserify',
        port: 4567,
      },
    });

    const listen = jest.fn().mockReturnValue({ port: config.cliOptions.port });
    const log = jest.spyOn(console, 'log').mockImplementation();
    const getServer = jest
      .spyOn(webpack, 'getServer')
      .mockImplementation(() => ({
        listen,
      }));

    await serveHandler(config);

    expect(process.exitCode).not.toBe(1);
    expect(getServer).toHaveBeenCalledWith(config.cliOptions.root);
    expect(listen).toHaveBeenCalledWith(config.cliOptions.port);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining(
        `The server is listening on http://localhost:${config.cliOptions.port}.`,
      ),
    );
  });
});
