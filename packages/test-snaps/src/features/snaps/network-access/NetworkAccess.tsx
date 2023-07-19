import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import {
  NETWORK_ACCESS_PORT,
  NETWORK_ACCESS_SNAP_ID,
  NETWORK_ACCESS_VERSION,
} from './constants';

export const NetworkAccess: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(NETWORK_ACCESS_SNAP_ID, NETWORK_ACCESS_PORT),
      method: 'fetch',
    }).catch(logError);
  };

  return (
    <Snap
      name="Network Access Snap"
      snapId={NETWORK_ACCESS_SNAP_ID}
      port={NETWORK_ACCESS_PORT}
      version={NETWORK_ACCESS_VERSION}
      testId="network-access"
    >
      <Button
        variant="primary"
        id="sendNetworkAccessTest"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Fetch
      </Button>
      <Result>
        <span id="networkAccessResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
