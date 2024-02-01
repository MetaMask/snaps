import { DialogType } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import { getMockOptions } from '../../../../test-utils';
import { createStore, resolveInterface } from '../../store';
import { getShowDialogImplementation } from './show-dialog';

describe('getShowDialogImplementation', () => {
  it('returns the implementation of the `showDialog` hook', async () => {
    const { store, runSaga } = createStore('password', getMockOptions());
    const fn = getShowDialogImplementation(runSaga);

    const promise = fn(MOCK_SNAP_ID, DialogType.Alert, 'foo');
    store.dispatch(resolveInterface('result'));

    expect(await promise).toBe('result');
  });
});
