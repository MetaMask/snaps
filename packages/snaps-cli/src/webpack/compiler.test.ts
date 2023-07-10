import express from 'express';
import { Server } from 'http';
import { Compiler, Configuration } from 'webpack';
import merge from 'webpack-merge';

import { getMockConfig } from '../test-utils';
import { getCompiler, getServer } from './compiler';

jest.dontMock('fs');
jest.mock('express', () => {
  const fn = jest
    .fn()
    .mockImplementation(() => jest.requireActual('express')());

  // @ts-expect-error - We're mocking a function.
  // eslint-disable-next-line jest/prefer-spy-on
  fn.static = jest.fn().mockReturnValue(jest.fn());

  return fn;
});

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

    const { port, server: httpServer } = await server.listen();

    expect(port).toBeGreaterThan(0);
    expect(httpServer).toBeInstanceOf(Server);

    httpServer.close();
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

    const { port, server: httpServer } = await server.listen();
    expect(port).toBe(config.server.port);

    httpServer.close();
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

    const { port, server: httpServer } = await server.listen(32432);
    expect(port).toBe(32432);

    httpServer.close();
  });

  it('sets headers on the response', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    getServer(config);
    const mock = express.static as jest.MockedFunction<typeof express.static>;

    expect(mock).toHaveBeenCalled();
    const setHeaders = mock.mock.calls[0][1]?.setHeaders;
    expect(setHeaders).toBeInstanceOf(Function);

    const response = {
      setHeader: jest.fn(),
    };

    // @ts-expect-error - Partial response mock.
    setHeaders?.(response, '/foo/bar.js', undefined);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-cache',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*',
    );
  });

  it('throws if the port is already in use', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    const server = getServer(config);

    const { mock } = express as jest.MockedFunction<typeof express>;
    const app = mock.results[0].value;

    jest.spyOn(app, 'listen').mockImplementationOnce(() => {
      throw new Error('Address already in use.');
    });

    await expect(server.listen()).rejects.toThrow('Address already in use.');
  });
});
