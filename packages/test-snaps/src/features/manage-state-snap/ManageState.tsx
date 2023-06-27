import { FunctionComponent } from 'react';

import { Tag, useInvokeQuery } from '../../api';
import { Result, Snap } from '../../components';
import { getSnapId, useInstalled } from '../../utils';
import { ClearData } from './ClearData';
import { SendData } from './SendData';

export const MANAGE_STATE_ID = 'npm:@metamask/test-snap-managestate';
export const MANAGE_STATE_PORT = 8004;

export const MANAGE_STATE_ACTUAL_ID = getSnapId(
  MANAGE_STATE_ID,
  MANAGE_STATE_PORT,
);

export const ManageState: FunctionComponent = () => {
  const isInstalled = useInstalled(MANAGE_STATE_ACTUAL_ID);
  const { data: state } = useInvokeQuery(
    {
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'retrieveTestData',
      tags: [Tag.TestState],
    },
    {
      skip: !isInstalled,
    },
  );

  return (
    <Snap
      name="Manage State Snap"
      snapId={MANAGE_STATE_ID}
      port={MANAGE_STATE_PORT}
      testId="ManageState"
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
