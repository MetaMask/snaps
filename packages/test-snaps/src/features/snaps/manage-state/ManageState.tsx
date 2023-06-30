import { FunctionComponent } from 'react';

import { Result, Snap } from '../../../components';
import { ClearData, SendData } from './components';
import { MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT } from './constants';
import { useSnapState } from './hooks';

export const ManageState: FunctionComponent = () => {
  const state = useSnapState();

  return (
    <Snap
      name="Manage State Snap"
      snapId={MANAGE_STATE_SNAP_ID}
      port={MANAGE_STATE_PORT}
      testId="manage-state"
    >
      <Result className="mb-3">
        <span id="retrieveManageStateResult">
          {JSON.stringify(state, null, 2)}
        </span>
      </Result>

      <SendData />
      <ClearData />
    </Snap>
  );
};
