import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';
import { resolve } from 'path';

import { writeManifest } from './manifest';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    writeFile: jest.fn(),
  },
}));

describe('writeManifest', () => {
  it('formats the manifest with Prettier before writing to disk', async () => {
    const manifest = JSON.stringify(getSnapManifest());
    await writeManifest('test.json', manifest);

    expect(jest.mocked(fs.writeFile).mock.calls[0][1]).toMatchInlineSnapshot(`
      "{
        "version": "1.0.0",
        "description": "The test example snap!",
        "proposedName": "@metamask/example-snap",
        "repository": {
          "type": "git",
          "url": "https://github.com/MetaMask/example-snap.git"
        },
        "source": {
          "shasum": "rNyfINgNh161cBmUop+F7xlE+GSEDZH53Y/HDpGLGGg=",
          "location": {
            "npm": {
              "filePath": "dist/bundle.js",
              "packageName": "@metamask/example-snap",
              "registry": "https://registry.npmjs.org",
              "iconPath": "images/icon.svg"
            }
          }
        },
        "initialPermissions": {
          "snap_dialog": {},
          "endowment:rpc": { "snaps": true, "dapps": false }
        },
        "manifestVersion": "0.1"
      }
      "
    `);
  });

  it('uses a custom Prettier config if found', async () => {
    const manifest = JSON.stringify(getSnapManifest());
    await writeManifest(
      resolve(__dirname, '__fixtures__', 'foo.json'),
      manifest,
    );

    expect(jest.mocked(fs.writeFile).mock.calls[0][1]).toMatchInlineSnapshot(`
      "{
          "version": "1.0.0",
          "description": "The test example snap!",
          "proposedName": "@metamask/example-snap",
          "repository": {
              "type": "git",
              "url": "https://github.com/MetaMask/example-snap.git"
          },
          "source": {
              "shasum": "rNyfINgNh161cBmUop+F7xlE+GSEDZH53Y/HDpGLGGg=",
              "location": {
                  "npm": {
                      "filePath": "dist/bundle.js",
                      "packageName": "@metamask/example-snap",
                      "registry": "https://registry.npmjs.org",
                      "iconPath": "images/icon.svg"
                  }
              }
          },
          "initialPermissions": {
              "snap_dialog": {},
              "endowment:rpc": { "snaps": true, "dapps": false }
          },
          "manifestVersion": "0.1"
      }
      "
    `);
  });

  it('accepts a custom write function', async () => {
    const fn = jest.fn();
    const manifest = JSON.stringify(getSnapManifest());
    await writeManifest('test.json', manifest, fn);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][1]).toMatchInlineSnapshot(`
      "{
        "version": "1.0.0",
        "description": "The test example snap!",
        "proposedName": "@metamask/example-snap",
        "repository": {
          "type": "git",
          "url": "https://github.com/MetaMask/example-snap.git"
        },
        "source": {
          "shasum": "rNyfINgNh161cBmUop+F7xlE+GSEDZH53Y/HDpGLGGg=",
          "location": {
            "npm": {
              "filePath": "dist/bundle.js",
              "packageName": "@metamask/example-snap",
              "registry": "https://registry.npmjs.org",
              "iconPath": "images/icon.svg"
            }
          }
        },
        "initialPermissions": {
          "snap_dialog": {},
          "endowment:rpc": { "snaps": true, "dapps": false }
        },
        "manifestVersion": "0.1"
      }
      "
    `);
  });
});
