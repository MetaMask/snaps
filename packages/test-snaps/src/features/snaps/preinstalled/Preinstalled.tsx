import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { PREINSTALLED_SNAP_ID, PREINSTALLED_VERSION } from './constants';

export const Preinstalled: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: PREINSTALLED_SNAP_ID,
      method: 'showDialog',
    }).catch(logError);
  };

  return (
    <Snap
      name="Preinstalled Snap"
      snapId={PREINSTALLED_SNAP_ID}
      version={PREINSTALLED_VERSION}
      testId="preinstalled-snap"
    >
      <Button
        variant="primary"
        id="showPreinstalledDialog"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Show dialog
      </Button>
      <Result>
        <span id="rpcResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
