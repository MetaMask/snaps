import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import {
  detectSnapLocation,
  fetchSnap,
  NodeThreadExecutionService,
} from '@metamask/snaps-controllers';
import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { VirtualFile } from '@metamask/snaps-utils';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';

import { getMockOptions, getMockServer } from '../../test-utils';
import { DEFAULT_SRP } from './constants';
import { getHooks, handleInstallSnap } from './simulation';

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

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

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

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { getSnapFile } = getHooks(getMockOptions(), snapFiles);
    const file = await getSnapFile('foo.json', AuxiliaryFileEncoding.Utf8);
    expect(file).toStrictEqual(value);

    await close();
  });
});
