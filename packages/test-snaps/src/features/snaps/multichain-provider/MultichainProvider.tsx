import { logError } from '@metamask/snaps-utils';
import type { CaipChainId } from '@metamask/utils';
import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { SignMessage, SignTypedData, SwitchChain } from './components';
import {
  MULTICHAIN_PROVIDER_SNAP_ID,
  MULTICHAIN_PROVIDER_SNAP_PORT,
  MULTICHAIN_PROVIDER_VERSION,
} from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';

export const MultichainProvider: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();
  const [scope, setScope] = useState<CaipChainId>('eip155:1');

  const handleSubmit = (method: string) => {
    invokeSnap({
      snapId: getSnapId(
        MULTICHAIN_PROVIDER_SNAP_ID,
        MULTICHAIN_PROVIDER_SNAP_PORT,
      ),
      method,
      params: {
        scope,
      },
    }).catch(logError);
  };

  const handleCreateSession = () => handleSubmit('createSession');
  const handleGetChainId = () => handleSubmit('getChainId');
  const handleGetAccounts = () => handleSubmit('getAccounts');

  return (
    <Snap
      name="Multichain Provider Snap"
      snapId={MULTICHAIN_PROVIDER_SNAP_ID}
      port={MULTICHAIN_PROVIDER_SNAP_PORT}
      version={MULTICHAIN_PROVIDER_VERSION}
      testId="multichain-provider"
    >
      <Button
        id="sendCreateSession"
        className="mb-3"
        disabled={isLoading}
        onClick={handleCreateSession}
      >
        Create Session
      </Button>
      <SwitchChain onChange={setScope} />
      <ButtonGroup>
        <Button
          variant="secondary"
          id="sendMultichainChainId"
          className="mb-3"
          disabled={isLoading}
          onClick={handleGetChainId}
        >
          Get Chain ID
        </Button>
        <Button
          variant="primary"
          id="sendMultichainAccounts"
          className="mb-3"
          disabled={isLoading}
          onClick={handleGetAccounts}
        >
          Get Accounts
        </Button>
      </ButtonGroup>
      <Result className="mb-3">
        <span id="multichainProviderResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
      <SignMessage scope={scope} />
      <SignTypedData scope={scope} />
    </Snap>
  );
};
