import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result, Snap } from '../../components';
import { getSnapId } from '../../utils/id';

const ETHPROVIDER_SNAP_ID = 'npm:@metamask/test-snap-ethprovider';
const ETHPROVIDER_SNAP_PORT = 8013;

export const Ethprovider: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(ETHPROVIDER_SNAP_ID, ETHPROVIDER_SNAP_PORT),
      method: 'ethproviderTest',
    });
  };

  return (
    <Snap
      name="ethereum-provider Snap"
      snapId={ETHPROVIDER_SNAP_ID}
      port={ETHPROVIDER_SNAP_PORT}
      testId="EthproviderSnap"
    >
      <Button
        variant="primary"
        id="sendEthprovider"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Send Test to ethereum-provider Snap
      </Button>
      <Result>
        <span id="ethproviderResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
