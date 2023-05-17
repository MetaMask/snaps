import { DialogType } from '@metamask/rpc-methods';
import { text } from '@metamask/snaps-ui';
import { expectSaga } from 'redux-saga-test-plan';

import { addNotification } from '../notifications';
import {
  getSnapState,
  showDialog,
  showInAppNotification,
  showNativeNotification,
  updateSnapState,
} from './hooks';
import { DEFAULT_SNAP_ID } from './sagas';
import {
  closeUserInterface,
  getSnapName,
  getSnapStateSelector,
  resolveUserInterface,
  setSnapState,
  showUserInterface,
} from './slice';
import { MOCK_MANIFEST_FILE } from './test/mockManifest';

Object.defineProperty(globalThis, 'Notification', {
  value: class Notification {
    static permission = 'default';

    static requestPermission = jest.fn().mockResolvedValue('granted');
  },
});

describe('showDialog', () => {
  it('shows a dialog', async () => {
    await expectSaga(showDialog, DEFAULT_SNAP_ID, DialogType.Alert, text('foo'))
      .withState({
        simulation: {
          manifest: MOCK_MANIFEST_FILE,
        },
      })
      .select(getSnapName)
      .put(
        showUserInterface({
          snapId: DEFAULT_SNAP_ID,
          snapName: '@metamask/example-snap',
          type: DialogType.Alert,
          node: text('foo'),
        }),
      )
      .dispatch(resolveUserInterface('foo'))
      .put(closeUserInterface())
      .returns('foo')
      .silentRun();
  });
});

describe('showNativeNotification', () => {
  it('requests permissions', async () => {
    await expectSaga(showNativeNotification, DEFAULT_SNAP_ID, {
      type: 'native',
      message: 'foo',
    })
      .withState({
        simulation: {
          manifest: MOCK_MANIFEST_FILE,
        },
      })
      .call([Notification, 'requestPermission'])
      .returns(null)
      .silentRun();
  });

  it('shows a notification if the user did not grant permissions', async () => {
    jest.spyOn(Notification, 'requestPermission').mockResolvedValue('denied');

    await expectSaga(showNativeNotification, DEFAULT_SNAP_ID, {
      type: 'native',
      message: 'foo',
    })
      .withState({
        simulation: {
          manifest: MOCK_MANIFEST_FILE,
        },
      })
      .call([Notification, 'requestPermission'])
      .put(
        addNotification(
          'Unable to show browser notification. Make sure notifications are enabled in your browser settings.',
        ),
      )
      .returns(null)
      .silentRun();
  });
});

describe('showInAppNotification', () => {
  it('shows a notification', async () => {
    await expectSaga(showInAppNotification, DEFAULT_SNAP_ID, {
      type: 'inApp',
      message: 'foo',
    })
      .put(addNotification('foo'))
      .returns(null)
      .silentRun();
  });
});

describe('updateSnapState', () => {
  it('puts the new snap state', async () => {
    await expectSaga(updateSnapState, DEFAULT_SNAP_ID, 'foo')
      .withState({
        simulation: {
          snapState: null,
        },
      })
      .put(setSnapState('foo'))
      .silentRun();
  });
});

describe('getSnapState', () => {
  it('returns the selected snap state', async () => {
    await expectSaga(getSnapState, DEFAULT_SNAP_ID)
      .withState({
        simulation: {
          snapState: 'foo',
        },
      })
      .select(getSnapStateSelector)
      .returns('foo')
      .silentRun();
  });
});
