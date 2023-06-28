import { logError } from '@metamask/snaps-utils';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { NETWORK_ACCESS_PORT, NETWORK_ACCESS_SNAP_ID } from './constants';
import { useInvokeMutation } from '../../../api';
import { Snap } from '../../../components';
import { getSnapId } from '../../../utils';

export const NetworkAccess: FunctionComponent = () => {
  const [invokeSnap, { isLoading }] = useInvokeMutation();

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
    </Snap>
  );
};
