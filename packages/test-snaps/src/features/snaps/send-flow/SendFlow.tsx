import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import {
  SEND_FLOW_SNAP_ID,
  SEND_FLOW_SNAP_PORT,
  SEND_FLOW_VERSION,
} from './constants';

export const SendFlow: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();
  const snapId = getSnapId(SEND_FLOW_SNAP_ID, SEND_FLOW_SNAP_PORT);

  const handleSubmitDisplay = () => {
    invokeSnap({
      snapId,
      method: 'display',
    }).catch(logError);
  };

  return (
    <Snap
      name="Send Flow Snap"
      snapId={SEND_FLOW_SNAP_ID}
      port={SEND_FLOW_SNAP_PORT}
      version={SEND_FLOW_VERSION}
      testId="dialogs"
    >
      <Button
        id="display"
        onClick={handleSubmitDisplay}
        disabled={isLoading}
        className="mb-3"
      >
        Custom
      </Button>

      <Result>
        <span id="dialogResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </Snap>
  );
};
