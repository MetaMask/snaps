import { logError } from '@metamask/snaps-utils';
import { numberToHex } from '@metamask/utils';
import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { SignMessage, SignTypedData, SwitchChain } from './components';
import {
  ETHEREUM_PROVIDER_SNAP_ID,
  ETHEREUM_PROVIDER_SNAP_PORT,
  ETHEREUM_PROVIDER_VERSION,
} from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';

export const EthereumProvider: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();
  const [chainId, setChainId] = useState<number>(1);

  const handleSubmit = (method: string) => {
    invokeSnap({
      snapId: getSnapId(ETHEREUM_PROVIDER_SNAP_ID, ETHEREUM_PROVIDER_SNAP_PORT),
      method,
      params: {
        chainId: numberToHex(chainId),
      },
    }).catch(logError);
  };

  const handleGetChainId = () => handleSubmit('getChainId');
  const handleGetAccounts = () => handleSubmit('getAccounts');

  return (
    <Snap
      name="Ethereum Provider Snap"
      snapId={ETHEREUM_PROVIDER_SNAP_ID}
      port={ETHEREUM_PROVIDER_SNAP_PORT}
      version={ETHEREUM_PROVIDER_VERSION}
      testId="ethereum-provider"
    >
      <SwitchChain onChange={setChainId} />
      <ButtonGroup>
        <Button
          variant="secondary"
          id="sendEthprovider"
          className="mb-3"
          disabled={isLoading}
          onClick={handleGetChainId}
        >
          Get Chain ID
        </Button>
        <Button
          variant="primary"
          id="sendEthproviderAccounts"
          className="mb-3"
          disabled={isLoading}
          onClick={handleGetAccounts}
        >
          Get Accounts
        </Button>
      </ButtonGroup>
      <Result className="mb-3">
        <span id="ethproviderResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
      <SignMessage chainId={chainId} />
      <SignTypedData chainId={chainId} />
    </Snap>
  );
};
