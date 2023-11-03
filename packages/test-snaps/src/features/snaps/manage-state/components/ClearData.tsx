import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Tag, useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { MANAGE_STATE_PORT, MANAGE_STATE_SNAP_ID } from '../constants';

export const ClearData: FunctionComponent<{ encrypted: boolean }> = ({
  encrypted,
}) => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleClick = () => {
    invokeSnap({
      snapId: getSnapId(MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT),
      method: 'clearState',
      params: { encrypted },
      tags: [encrypted ? Tag.TestState : Tag.UnencryptedTestState],
    }).catch(logError);
  };

  return (
    <>
      <Button
        id={encrypted ? 'clearManageState' : 'clearUnencryptedManageState'}
        onClick={handleClick}
        disabled={isLoading}
        className="mb-3"
      >
        Clear Data
      </Button>
      <Result className="mb-3">
        <span
          id={
            encrypted
              ? 'clearManageStateResult'
              : 'clearUnencryptedManageStateResult'
          }
        >
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
