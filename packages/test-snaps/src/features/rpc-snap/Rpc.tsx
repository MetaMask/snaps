import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result, Snap } from '../../components';
import { getSnapId } from '../../utils';

const RPC_SNAP_ID = 'npm:@metamask/test-snap-rpc';
const RPC_SNAP_PORT = 8007;

export const Rpc: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(RPC_SNAP_ID, RPC_SNAP_PORT),
      method: 'send',
    });
  };

  return (
    <Snap
      name="RPC Snap"
      snapId={RPC_SNAP_ID}
      port={RPC_SNAP_PORT}
      testId="RpcSnap"
    >
      <Button
        variant="primary"
        id="sendRpc"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Send Test to RPC Snap
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
