import { VirtualFile } from '@metamask/snaps-utils';
import { stringToBytes } from '@metamask/utils';
import fetchMock from 'jest-fetch-mock';
import { expectSaga } from 'redux-saga-test-plan';

import {
  setAuxiliaryFiles,
  setIcon,
  setManifest,
  setSourceCode,
} from '../simulation';
import {
  MOCK_MANIFEST,
  MOCK_MANIFEST_FILE,
} from '../simulation/test/mockManifest';
import {
  MOCK_SNAP_ICON,
  MOCK_SNAP_ICON_FILE,
  MOCK_SNAP_SOURCE,
  MOCK_SNAP_SOURCE_FILE,
} from '../simulation/test/mockSnap';
import { fetchingSaga, pollingSaga } from './sagas';

fetchMock.enableMocks();

describe('pollingSaga', () => {
  it('calls the fetching saga and delay for local snaps', async () => {
    await expectSaga(pollingSaga)
      .withState({
        configuration: {
          snapId: 'local:http://localhost:8080',
        },
      })
      .call(fetchingSaga)
      .delay(500)
      .silentRun();
  });

  it('calls the fetching saga and not delay for npm snaps', async () => {
    await expectSaga(pollingSaga)
      .withState({
        configuration: {
          snapId: 'npm:@metamask/test-snap-bip32',
        },
      })
      .call(fetchingSaga)
      .not.delay(500)
      .silentRun();
  });
});

describe('fetchingSaga', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('fetches the snap and updates manifest and source code', async () => {
    fetchMock.mockResponses(
      JSON.stringify(MOCK_MANIFEST),
      MOCK_SNAP_SOURCE,
      MOCK_SNAP_ICON,
    );
    await expectSaga(fetchingSaga)
      .withState({
        configuration: {
          snapId: 'local:http://localhost:8080',
        },
        simulation: {
          manifest: null,
        },
      })
      .put(setManifest(MOCK_MANIFEST_FILE))
      .put(setSourceCode(MOCK_SNAP_SOURCE_FILE))
      .put(setAuxiliaryFiles([]))
      .put(setIcon(MOCK_SNAP_ICON_FILE))
      .silentRun();
  });

  it('fetches the snap and updates auxiliary files', async () => {
    const manifest = {
      ...MOCK_MANIFEST,
      source: { ...MOCK_MANIFEST.source, files: ['./src/foo.json'] },
    };
    const json = JSON.stringify({ foo: 'bar' });
    const auxiliaryFile = new VirtualFile({
      path: 'src/foo.json',
      value: stringToBytes(json),
      data: { canonicalPath: 'local:http://localhost:8080/src/foo.json' },
    });
    fetchMock.mockResponses(
      JSON.stringify(manifest),
      MOCK_SNAP_SOURCE,
      json,
      MOCK_SNAP_ICON,
    );
    await expectSaga(fetchingSaga)
      .withState({
        configuration: {
          snapId: 'local:http://localhost:8080',
        },
        simulation: {
          manifest: null,
        },
      })
      .put(setSourceCode(MOCK_SNAP_SOURCE_FILE))
      .put(setAuxiliaryFiles([auxiliaryFile]))
      .put(setIcon(MOCK_SNAP_ICON_FILE))
      .silentRun();
  });

  it('doesnt update the source code if checksum matches cached checksum', async () => {
    fetchMock.mockResponses(JSON.stringify(MOCK_MANIFEST));
    await expectSaga(fetchingSaga)
      .withState({
        configuration: {
          snapId: 'local:http://localhost:8080',
        },
        simulation: {
          manifest: MOCK_MANIFEST_FILE,
        },
      })
      .not.put.actionType(setManifest.type)
      .not.put.actionType(setSourceCode.type)
      .not.put.actionType(setIcon.type)
      .silentRun();
  });
});
