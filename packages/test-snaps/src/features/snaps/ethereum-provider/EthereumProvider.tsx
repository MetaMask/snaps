import { logError } from '@metamask/snaps-utils';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import {
  ETHEREUM_PROVIDER_SNAP_ID,
  ETHEREUM_PROVIDER_SNAP_PORT,
} from './constants';

export const EthereumProvider: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(ETHEREUM_PROVIDER_SNAP_ID, ETHEREUM_PROVIDER_SNAP_PORT),
      method: 'getVersion',
    }).catch(logError);
  };

  return (
    <Snap
      name="Ethereum Provider Snap"
      snapId={ETHEREUM_PROVIDER_SNAP_ID}
      port={ETHEREUM_PROVIDER_SNAP_PORT}
      testId="ethereum-provider"
    >
      <Button
        variant="primary"
        id="sendEthprovider"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Get Version
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
