import { resolve } from 'path';

import { startServer } from './server';

describe('startServer', () => {
  it('starts a server that serves the root directory', async () => {
    const server = await startServer({
      enabled: true,
      port: 0,
      root: resolve(__dirname, '../test-utils/snap'),
    });

    expect(server).toBeDefined();

    const { port } = server.address() as { port: number };
    const response = await fetch(`http://localhost:${port}/snap.manifest.json`);
    const manifest = await response.json();

    expect(manifest).toMatchInlineSnapshot(`
      {
        "description": "baz",
        "initialPermissions": {},
        "manifestVersion": "0.1",
        "proposedName": "bar",
        "source": {
          "location": {
            "npm": {
              "filePath": "snap.js",
              "packageName": "qux",
              "registry": "https://registry.npmjs.org",
            },
          },
          "shasum": "uaLwMO39qzKbshqPM6W2Ju7gkO/czuwgNKpjzXRXJj0=",
        },
        "version": "1.0.0",
      }
    `);

    server.close();
  });

  it('throws if the root path is not a directory', async () => {
    await expect(
      startServer({
        enabled: true,
        port: 0,
        root: resolve(__dirname, '../test-utils/snap/snap.js'),
      }),
    ).rejects.toThrow(/Root directory ".*" is not a directory\./u);
  });

  it('throws if the bundle path does not exist', async () => {
    await expect(
      startServer({
        enabled: true,
        port: 0,
        root: resolve(__dirname, '../test-utils/snap/invalid-snap'),
      }),
    ).rejects.toThrow(
      /File ".*" does not exist, or is not a file\. Did you forget to build your snap\?/u,
    );
  });

  it('throws if the root path is not specified', async () => {
    await expect(
      startServer({
        enabled: true,
        port: 0,
        root: '',
      }),
    ).rejects.toThrow('You must specify a root directory.');
  });

  it('throws if the server fails to start', async () => {
    const server = await startServer({
      enabled: true,
      port: 0,
      root: resolve(__dirname, '../test-utils/snap'),
    });

    const { port } = server.address() as { port: number };

    await expect(
      startServer({
        enabled: true,
        port,
        root: resolve(__dirname, '../test-utils/snap'),
      }),
    ).rejects.toThrow('listen EADDRINUSE: address already in use');

    server.close();
  });
});
