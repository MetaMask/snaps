import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import { NodeThreadExecutionService } from '@metamask/snaps-controllers';
import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { VirtualFile } from '@metamask/snaps-utils';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';
import { stringToBytes } from '@metamask/utils';

import { getMockOptions } from '../../test-utils';
import { getMockServer } from '../../test-utils/server';
import { DEFAULT_SRP } from './constants';
import { fetchSnap, getHooks, handleInstallSnap } from './simulation';

describe('handleInstallSnap', () => {
  it('installs a Snap and returns the execution service', async () => {
    const { snapId, close } = await getMockServer();
    const installedSnap = await handleInstallSnap(snapId);

    expect(installedSnap.executionService).toBeInstanceOf(
      NodeThreadExecutionService,
    );

    await close();
  });
});

describe('getHooks', () => {
  it('returns the `getMnemonic` hook', async () => {
    const { snapId, close } = await getMockServer();
    const snapFiles = await fetchSnap(snapId);

    const { getMnemonic } = getHooks(getMockOptions(), snapFiles);
    expect(await getMnemonic()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );

    await close();
  });

  it('returns the `getSnapFile` hook', async () => {
    const value = JSON.stringify({ bar: 'baz' });
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest({
        files: ['foo.json'],
      }),
      auxiliaryFiles: [
        new VirtualFile({
          path: 'foo.json',
          value,
        }),
      ],
    });

    const snapFiles = await fetchSnap(snapId);

    const { getSnapFile } = getHooks(getMockOptions(), snapFiles);
    const file = await getSnapFile('foo.json', AuxiliaryFileEncoding.Utf8);
    expect(file).toStrictEqual(value);

    await close();
  });
});

describe('fetchSnap', () => {
  it('fetches the Snap files', async () => {
    // Note that we hard-code the port here, so that the snapshot is
    // deterministic.
    const { snapId, close } = await getMockServer({ port: 58531 });
    const snap = await fetchSnap(snapId);

    expect(snap).toMatchInlineSnapshot(`
      {
        "auxiliaryFiles": [],
        "localizationFiles": [],
        "manifest": VirtualFile {
          "data": {
            "canonicalPath": "local:http://localhost:58531/snap.manifest.json",
          },
          "path": "snap.manifest.json",
          "result": {
            "description": "The test example snap!",
            "initialPermissions": {},
            "manifestVersion": "0.1",
            "proposedName": "@metamask/example-snap",
            "repository": {
              "type": "git",
              "url": "https://github.com/MetaMask/example-snap.git",
            },
            "source": {
              "location": {
                "npm": {
                  "filePath": "dist/bundle.js",
                  "iconPath": "images/icon.svg",
                  "packageName": "@metamask/example-snap",
                  "registry": "https://registry.npmjs.org",
                },
              },
              "shasum": "HL1v1/9uiW1kB99lVd5ZK/hAeljFiXS/tRE2WG+Nv/A=",
            },
            "version": "1.0.0",
          },
          "value": "{"version":"1.0.0","description":"The test example snap!","proposedName":"@metamask/example-snap","repository":{"type":"git","url":"https://github.com/MetaMask/example-snap.git"},"source":{"shasum":"HL1v1/9uiW1kB99lVd5ZK/hAeljFiXS/tRE2WG+Nv/A=","location":{"npm":{"filePath":"dist/bundle.js","packageName":"@metamask/example-snap","registry":"https://registry.npmjs.org","iconPath":"images/icon.svg"}}},"initialPermissions":{},"manifestVersion":"0.1"}",
        },
        "sourceCode": VirtualFile {
          "data": {
            "canonicalPath": "local:http://localhost:58531/dist/bundle.js",
          },
          "path": "dist/bundle.js",
          "result": undefined,
          "value": Uint8Array [
            10,
            32,
            32,
            109,
            111,
            100,
            117,
            108,
            101,
            46,
            101,
            120,
            112,
            111,
            114,
            116,
            115,
            46,
            111,
            110,
            82,
            112,
            99,
            82,
            101,
            113,
            117,
            101,
            115,
            116,
            32,
            61,
            32,
            40,
            123,
            32,
            114,
            101,
            113,
            117,
            101,
            115,
            116,
            32,
            125,
            41,
            32,
            61,
            62,
            32,
            123,
            10,
            32,
            32,
            32,
            32,
            99,
            111,
            110,
            115,
            111,
            108,
            101,
            46,
            108,
            111,
            103,
            40,
            34,
            72,
            101,
            108,
            108,
            111,
            44,
            32,
            119,
            111,
            114,
            108,
            100,
            33,
            34,
            41,
            59,
            10,
            10,
            32,
            32,
            32,
            32,
            99,
            111,
            110,
            115,
            116,
            32,
            123,
            32,
            109,
            101,
            116,
            104,
            111,
            100,
            44,
            32,
            105,
            100,
            32,
            125,
            32,
            61,
            32,
            114,
            101,
            113,
            117,
            101,
            115,
            116,
            59,
            10,
            32,
            32,
            32,
            32,
            114,
            101,
            116,
            117,
            114,
            110,
            32,
            109,
            101,
            116,
            104,
            111,
            100,
            32,
            43,
            32,
            105,
            100,
            59,
            10,
            32,
            32,
            125,
            59,
            10,
          ],
        },
        "svgIcon": VirtualFile {
          "data": {
            "canonicalPath": "local:http://localhost:58531/images/icon.svg",
          },
          "path": "images/icon.svg",
          "result": undefined,
          "value": Uint8Array [
            60,
            115,
            118,
            103,
            32,
            47,
            62,
          ],
        },
      }
    `);

    await close();
  });

  it('fetches auxiliary files', async () => {
    const value = JSON.stringify({ bar: 'baz' });
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest({
        files: ['foo.json'],
      }),
      auxiliaryFiles: [
        new VirtualFile({
          path: 'foo.json',
          value,
        }),
      ],
    });

    const snap = await fetchSnap(snapId);
    expect(snap.auxiliaryFiles).toHaveLength(1);
    expect(snap.auxiliaryFiles[0].path).toBe('foo.json');
    expect(snap.auxiliaryFiles[0].value).toStrictEqual(stringToBytes(value));

    await close();
  });

  it('fetches localization files', async () => {
    const file = {
      locale: 'en',
      messages: {},
    };

    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest({
        locales: ['locales/en.json'],
      }),
      localizationFiles: [
        {
          path: 'locales/en.json',
          file,
        },
      ],
    });

    const snap = await fetchSnap(snapId);
    expect(snap.localizationFiles).toHaveLength(1);
    expect(snap.localizationFiles[0].path).toBe('locales/en.json');
    expect(snap.localizationFiles[0].value).toStrictEqual(
      stringToBytes(JSON.stringify(file)),
    );

    await close();
  });
});
