import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { SignMessage } from './components';
import { BIP_44_PORT, BIP_44_SNAP_ID, BIP_44_VERSION } from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import { useEntropySelector } from '../get-entropy/hooks';

export const BIP44: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();
  const { selector, source } = useEntropySelector({
    id: 'bip44',
    snapId: BIP_44_SNAP_ID,
    port: BIP_44_PORT,
  });

  const handleClick = (method: string, coinType: number) => () => {
    invokeSnap({
      snapId: getSnapId(BIP_44_SNAP_ID, BIP_44_PORT),
      method,
      params: {
        coinType,
        ...(source !== undefined && { source }),
      },
    }).catch(logError);
  };

  return (
    <Snap
      name="BIP-44 Snap"
      snapId={BIP_44_SNAP_ID}
      port={BIP_44_PORT}
      version={BIP_44_VERSION}
      testId="bip44"
    >
      {selector}
      <ButtonGroup className="mb-3">
        <Button
          id="sendBip44Test"
          data-testid="send-test"
          onClick={handleClick('getPublicKey', 1)}
          disabled={isLoading}
        >
          Get Public Key
        </Button>
        <Button
          variant="secondary"
          id="sendInvalidBip44Test"
          data-testid="send-invalid-test"
          onClick={handleClick('getPublicKey', 2)}
          disabled={isLoading}
        >
          Send Invalid
        </Button>
      </ButtonGroup>
      <Result className="mb-3">
        <span id="bip44Result" data-testid="test-result">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>

      <SignMessage source={source} />
    </Snap>
  );
};
