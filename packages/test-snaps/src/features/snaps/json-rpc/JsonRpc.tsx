import { logError } from '@metamask/snaps-utils';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import { JSON_RPC_SNAP_ID, JSON_RPC_SNAP_PORT } from './constants';

export const JsonRpc: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(JSON_RPC_SNAP_ID, JSON_RPC_SNAP_PORT),
      method: 'invokeSnap',
    }).catch(logError);
  };

  return (
    <Snap
      name="JSON-RPC Snap"
      snapId={JSON_RPC_SNAP_ID}
      port={JSON_RPC_SNAP_PORT}
      testId="json-rpc"
    >
      <Button
        variant="primary"
        id="sendRpc"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Invoke Snap
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
