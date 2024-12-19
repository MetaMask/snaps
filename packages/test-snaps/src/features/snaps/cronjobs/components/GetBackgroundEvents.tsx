import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { CRONJOBS_SNAP_PORT, CRONJOBS_SNAP_ID } from '../constants';

export const GetBackgroundEvents: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleClick = () => {
    invokeSnap({
      snapId: getSnapId(CRONJOBS_SNAP_ID, CRONJOBS_SNAP_PORT),
      method: 'getBackgroundEvents',
    }).catch(logError);
  };

  return (
    <>
      <Button
        type="submit"
        id="getBackgroundEvents"
        disabled={isLoading}
        onClick={handleClick}
      >
        Get background events
      </Button>

      <Result className="mb-3">
        <span id="getBackgroundEventsResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
