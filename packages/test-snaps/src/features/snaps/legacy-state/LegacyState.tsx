import type { FunctionComponent } from 'react';

import { Result, Snap } from '../../../components';
import {
  MANAGE_STATE_SNAP_ID,
  MANAGE_STATE_PORT,
  MANAGE_STATE_VERSION,
  useSnapState,
} from '../state';
import { ClearData, SendData } from './components';

export const LegacyState: FunctionComponent = () => {
  const encryptedState = useSnapState('legacy_getState', true);
  const unencryptedState = useSnapState('legacy_getState', false);

  return (
    <Snap
      name="Legacy State Snap"
      snapId={MANAGE_STATE_SNAP_ID}
      port={MANAGE_STATE_PORT}
      version={MANAGE_STATE_VERSION}
      testId="manage-state"
    >
      <Result className="mb-3">
        <span id="retrieveManageStateResult">
          {JSON.stringify(encryptedState, null, 2)}
        </span>
      </Result>

      <SendData encrypted={true} />
      <ClearData encrypted={true} />

      <Result className="mb-3">
        <span id="retrieveManageStateUnencryptedResult">
          {JSON.stringify(unencryptedState, null, 2)}
        </span>
      </Result>

      <SendData encrypted={false} />
      <ClearData encrypted={false} />
    </Snap>
  );
};
