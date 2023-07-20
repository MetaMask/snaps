import fetch from 'cross-fetch';
import http, { IncomingMessage, ServerResponse, Server } from 'http';
import serveMiddleware from 'serve-handler';
import type { Configuration } from 'webpack';
import { Compiler } from 'webpack';
import merge from 'webpack-merge';

import { getMockConfig } from '../test-utils';
import { getCompiler, getServer } from './compiler';

jest.dontMock('fs');
jest.mock('serve-handler', () =>
  jest.fn().mockImplementation((_request, response) => {
    response.end();
  }),
);

describe('getCompiler', () => {
  it('returns a Webpack compiler for the given config', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
    });

    const compiler = await getCompiler(config);
    expect(compiler).toBeInstanceOf(Compiler);
    expect(compiler.options.entry).toStrictEqual({
      main: {
        import: [config.input],
      },
    });
  });

  it('modifies the Webpack config if a customizer is provided', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      customizeWebpackConfig: (webpackConfig: Configuration) =>
        merge(webpackConfig, {
          entry: 'src/other.js',
        }),
    });

    const compiler = await getCompiler(config);
    expect(compiler).toBeInstanceOf(Compiler);
    expect(compiler.options.entry).toStrictEqual({
      main: {
        import: ['src/other.js'],
      },
    });
  });
});

describe('getServer', () => {
  it('creates a static server', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    const server = getServer(config);
    expect(server.listen).toBeInstanceOf(Function);

    const { port, server: httpServer, close } = await server.listen();

    expect(port).toBeGreaterThan(0);
    expect(httpServer).toBeInstanceOf(Server);

    await close();
  });

  it('listens to a specific port', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 38445,
      },
    });

    const server = getServer(config);

    const { port, close } = await server.listen();
    expect(port).toBe(config.server.port);

    await close();
  });

  it('listens to the port specified in the listen function', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 38445,
      },
    });

    const server = getServer(config);

    const { port, close } = await server.listen(32432);
    expect(port).toBe(32432);

    await close();
  });

  it('calls the serve middleware', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: __dirname,
        port: 0,
      },
    });

    const server = getServer(config);
    const { port, close } = await server.listen();

    const response = await fetch(`http://localhost:${port}/`);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');

    expect(serveMiddleware).toHaveBeenCalledWith(
      expect.any(IncomingMessage),
      expect.any(ServerResponse),
      expect.objectContaining({ public: __dirname }),
    );

    await close();
  });

  it('throws if the port is already in use', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    const createServer = jest.spyOn(http, 'createServer');
    const server = getServer(config);
    const httpServer: Server = createServer.mock.results[0].value;

    jest.spyOn(httpServer, 'listen').mockImplementationOnce(() => {
      throw new Error('Address already in use.');
    });

    await expect(server.listen()).rejects.toThrow('Address already in use.');

    httpServer.close();
  });

  it('throws if the server fails to close', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    const createServer = jest.spyOn(http, 'createServer');
    const server = getServer(config);
    const httpServer: Server = createServer.mock.results[0].value;

    // @ts-expect-error - Invalid mock.
    jest.spyOn(httpServer, 'close').mockImplementationOnce((callback) => {
      return callback?.(new Error('Failed to close server.'));
    });

    const { close } = await server.listen();
    await expect(close()).rejects.toThrow('Failed to close server.');

    httpServer.close();
  });
});
