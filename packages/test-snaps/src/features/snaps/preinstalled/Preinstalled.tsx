import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { PREINSTALLED_SNAP_ID, PREINSTALLED_VERSION } from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';

export const Preinstalled: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmitDialog = () => {
    invokeSnap({
      snapId: PREINSTALLED_SNAP_ID,
      method: 'showDialog',
    }).catch(logError);
  };

  const handleSubmitSettings = () => {
    invokeSnap({
      snapId: PREINSTALLED_SNAP_ID,
      method: 'getSettings',
    }).catch(logError);
  };

  const handleSubmitTrackError = () => {
    invokeSnap({
      snapId: PREINSTALLED_SNAP_ID,
      method: 'trackError',
    }).catch(logError);
  };

  const handleStartTrace = () => {
    invokeSnap({
      snapId: PREINSTALLED_SNAP_ID,
      method: 'startTrace',
    }).catch(logError);
  };

  const handleEndTrace = () => {
    invokeSnap({
      snapId: PREINSTALLED_SNAP_ID,
      method: 'endTrace',
    }).catch(logError);
  };

  return (
    <Snap
      name="Preinstalled Snap"
      snapId={PREINSTALLED_SNAP_ID}
      version={PREINSTALLED_VERSION}
      testId="preinstalled-snap"
    >
      <ButtonGroup className="mb-3">
        <Button
          variant="primary"
          id="showPreinstalledDialog"
          disabled={isLoading}
          onClick={handleSubmitDialog}
        >
          Show dialog
        </Button>
        <Button
          variant="primary"
          id="settings-state"
          disabled={isLoading}
          onClick={handleSubmitSettings}
        >
          Get settings state
        </Button>
        <Button
          variant="primary"
          id="trackError"
          disabled={isLoading}
          onClick={handleSubmitTrackError}
        >
          Track error
        </Button>
      </ButtonGroup>
      <ButtonGroup className="mb-3">
        <Button
          variant="primary"
          id="start-trace"
          disabled={isLoading}
          onClick={handleStartTrace}
        >
          Start trace
        </Button>
        <Button
          variant="primary"
          id="end-trace"
          disabled={isLoading}
          onClick={handleEndTrace}
        >
          End trace
        </Button>
      </ButtonGroup>
      <Result>
        <span id="rpcResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
