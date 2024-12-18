import type { FunctionComponent } from 'react';

import { Result, Snap } from '../../../components';
import { ClearState, GetState, SetState } from './components';
import {
  MANAGE_STATE_SNAP_ID,
  MANAGE_STATE_PORT,
  MANAGE_STATE_VERSION,
} from './constants';
import { useSnapState } from './hooks';

export const State: FunctionComponent = () => {
  const encryptedState = useSnapState('getState', true);
  const unencryptedState = useSnapState('getState', false);

  return (
    <Snap
      name="State Snap"
      snapId={MANAGE_STATE_SNAP_ID}
      port={MANAGE_STATE_PORT}
      version={MANAGE_STATE_VERSION}
      testId="state"
    >
      <Result className="mb-3">
        <pre
          id="encryptedStateResult"
          style={{
            margin: 0,
          }}
        >
          {JSON.stringify(encryptedState, null, 2)}
        </pre>
      </Result>

      <GetState encrypted={true} />
      <SetState encrypted={true} />
      <ClearState encrypted={true} />

      <Result className="mb-3">
        <pre
          id="unencryptedStateResult"
          style={{
            margin: 0,
          }}
        >
          {JSON.stringify(unencryptedState, null, 2)}
        </pre>
      </Result>

      <SetState encrypted={false} />
      <ClearState encrypted={false} />
    </Snap>
  );
};
