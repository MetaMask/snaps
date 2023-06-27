import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Snap } from '../../components';
import { getSnapId } from '../../utils';

const RPC_SNAP_ID = 'npm:@metamask/test-snap-networkaccess';
const RPC_SNAP_PORT = 8012;

export const NetworkAccess: FunctionComponent = () => {
  const [invokeSnap, { isLoading }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(RPC_SNAP_ID, RPC_SNAP_PORT),
      method: 'networkAccessTest',
    });
  };

  return (
    <Snap
      name="networkAccess Snap"
      snapId={RPC_SNAP_ID}
      port={RPC_SNAP_PORT}
      testId="NetworkAccessSnap"
    >
      <Button
        variant="primary"
        id="sendNetworkAccessTest"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Send Test to networkAccess Snap
      </Button>
    </Snap>
  );
};
