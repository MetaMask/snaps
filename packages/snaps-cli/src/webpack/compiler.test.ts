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
  it('returns a Webpack compiler for the given config', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
    });

    const compiler = getCompiler(config);
    expect(compiler).toBeInstanceOf(Compiler);
    expect(compiler.options.entry).toStrictEqual({
      main: {
        import: [config.input],
      },
    });
  });

  it('modifies the Webpack config if a customizer is provided', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      customizeWebpackConfig: (webpackConfig: Configuration) =>
        merge(webpackConfig, {
          entry: 'src/other.js',
        }),
    });

    const compiler = getCompiler(config);
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
    const server = getServer();
    expect(server.listen).toBeInstanceOf(Function);

    const { port, server: httpServer } = await server.listen(0);
    expect(port).toBeGreaterThan(0);
    expect(httpServer).toBeInstanceOf(Server);

    httpServer.close();
  });

  it('listens to a specific port', async () => {
    const server = getServer();

    const { port, server: httpServer } = await server.listen(38445);
    expect(port).toBe(38445);

    httpServer.close();
  });

  it('throws if the port is already in use', async () => {
    const server = getServer();

    const { mock } = express as jest.MockedFunction<typeof express>;
    const app = mock.results[0].value;

    jest.spyOn(app, 'listen').mockImplementationOnce(() => {
      throw new Error('Address already in use.');
    });

    await expect(server.listen(12345)).rejects.toThrow(
      'Address already in use.',
    );
  });
});
