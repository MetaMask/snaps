import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import fetch from 'cross-fetch';
import { promises as fs } from 'fs';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import serveMiddleware from 'serve-handler';

import { getAllowedPaths, getServer } from './server';

jest.mock('fs');
jest.mock('serve-handler', () =>
  jest.fn().mockImplementation((_request, response) => {
    response.end();
  }),
);

describe('getAllowedPaths', () => {
  it('returns the allowed paths for a given config', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/dist',
        filename: 'index.js',
      },
      server: {
        root: '/foo',
      },
    });

    const manifest = getSnapManifest();

    const allowedPaths = getAllowedPaths(config, manifest);
    expect(allowedPaths).toStrictEqual([
      'dist/index.js',
      'snap.manifest.json',
      'images/icon.svg',
    ]);
  });

  it('returns the allowed paths for a given config with auxiliary files', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/dist',
        filename: 'index.js',
      },
      server: {
        root: '/foo',
      },
    });

    const manifest = getSnapManifest({
      files: ['src/foo.js', 'src/bar.js'],
    });

    const allowedPaths = getAllowedPaths(config, manifest);
    expect(allowedPaths).toStrictEqual([
      'dist/index.js',
      'snap.manifest.json',
      'src/foo.js',
      'src/bar.js',
      'images/icon.svg',
    ]);
  });

  it('returns the allowed paths for a given config with localization files', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/dist',
        filename: 'index.js',
      },
      server: {
        root: '/foo',
      },
    });

    const manifest = getSnapManifest({
      locales: ['src/en.json', 'src/de.json'],
    });

    const allowedPaths = getAllowedPaths(config, manifest);
    expect(allowedPaths).toStrictEqual([
      'dist/index.js',
      'snap.manifest.json',
      'src/en.json',
      'src/de.json',
      'images/icon.svg',
    ]);
  });

  it('returns the allowed paths for a given config with auxiliary files and localization files', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/dist',
        filename: 'index.js',
      },
      server: {
        root: '/foo',
      },
    });

    const manifest = getSnapManifest({
      files: ['src/foo.js', 'src/bar.js'],
      locales: ['src/en.json', 'src/de.json'],
    });

    const allowedPaths = getAllowedPaths(config, manifest);
    expect(allowedPaths).toStrictEqual([
      'dist/index.js',
      'snap.manifest.json',
      'src/foo.js',
      'src/bar.js',
      'src/en.json',
      'src/de.json',
      'images/icon.svg',
    ]);
  });

  it('returns the allowed paths for a given config without an icon', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/dist',
        filename: 'index.js',
      },
      server: {
        root: '/foo',
      },
    });

    const manifest = getSnapManifest();
    delete manifest.source.location.npm.iconPath;

    const allowedPaths = getAllowedPaths(config, manifest);
    expect(allowedPaths).toStrictEqual(['dist/index.js', 'snap.manifest.json']);
  });
});

describe('getServer', () => {
  beforeEach(async () => {
    await fs.mkdir('/foo', { recursive: true });
    await fs.writeFile(
      '/foo/snap.manifest.json',
      JSON.stringify(getSnapManifest()),
    );
  });

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

  it('calls the serve middleware for allowed files', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    const server = getServer(config);
    const { port, close } = await server.listen();

    const response = await fetch(`http://localhost:${port}/snap.manifest.json`);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');

    expect(serveMiddleware).toHaveBeenCalledWith(
      expect.any(IncomingMessage),
      expect.any(ServerResponse),
      expect.objectContaining({ public: expect.stringContaining('foo') }),
    );

    await close();
  });

  it('responds with 404 for non-allowed files', async () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.js',
      server: {
        root: '/foo',
        port: 0,
      },
    });

    const server = getServer(config);
    const { port, close } = await server.listen();

    const response = await fetch(`http://localhost:${port}/`);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('');
    expect(serveMiddleware).not.toHaveBeenCalled();

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
