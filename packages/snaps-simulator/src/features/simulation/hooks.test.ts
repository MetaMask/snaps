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

jest.mock('@reduxjs/toolkit', () => ({
  ...jest.requireActual('@reduxjs/toolkit'),
  nanoid: () => 'foo',
}));

const snapId = 'local:http://localhost:8080';

describe('showDialog', () => {
  it('shows a dialog', async () => {
    await expectSaga(showDialog, snapId, DialogType.Alert, text('foo'))
      .withState({
        simulation: {
          manifest: MOCK_MANIFEST_FILE,
        },
      })
      .select(getSnapName)
      .put(
        showUserInterface({
          snapId,
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
    await expectSaga(showNativeNotification, snapId, {
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

    await expectSaga(showNativeNotification, snapId, {
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
        addNotification({
          id: 'foo',
          message:
            'Unable to show browser notification. Make sure notifications are enabled in your browser settings.',
        }),
      )
      .returns(null)
      .silentRun();
  });
});

describe('showInAppNotification', () => {
  it('shows a notification', async () => {
    await expectSaga(showInAppNotification, snapId, {
      type: 'inApp',
      message: 'foo',
    })
      .withState({
        simulation: {
          requestId: 'bar',
        },
      })
      .put(
        addNotification({
          id: 'bar',
          message: 'foo',
        }),
      )
      .returns(null)
      .silentRun();
  });
});

describe('updateSnapState', () => {
  it('puts the new snap state', async () => {
    await expectSaga(updateSnapState, snapId, 'foo')
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
    await expectSaga(getSnapState, snapId)
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
