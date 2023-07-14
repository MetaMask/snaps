import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Tag, useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { MANAGE_STATE_PORT, MANAGE_STATE_SNAP_ID } from '../constants';

export const ClearData: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleClick = () => {
    invokeSnap({
      snapId: getSnapId(MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT),
      method: 'clearState',
      tags: [Tag.TestState],
    }).catch(logError);
  };

  return (
    <>
      <Button
        id="clearManageState"
        onClick={handleClick}
        disabled={isLoading}
        className="mb-3"
      >
        Clear Data
      </Button>
      <Result>
        <span id="clearManageStateResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
