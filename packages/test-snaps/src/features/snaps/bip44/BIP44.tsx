import { logError } from '@metamask/snaps-utils';
import { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { SignMessage } from './components';
import { BIP_44_PORT, BIP_44_SNAP_ID } from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';

export const BIP44: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleClick = (method: string, coinType: number) => () => {
    invokeSnap({
      snapId: getSnapId(BIP_44_SNAP_ID, BIP_44_PORT),
      method,
      params: {
        coinType,
      },
    }).catch(logError);
  };

  return (
    <Snap
      name="BIP-44 Snap"
      snapId={BIP_44_SNAP_ID}
      port={BIP_44_PORT}
      testId="bip44"
    >
      <ButtonGroup className="mb-3">
        <Button
          id="sendBip44Test"
          data-testid="send-test"
          onClick={handleClick('getAccount', 1)}
          disabled={isLoading}
        >
          Send Test
        </Button>
        <Button
          variant="secondary"
          id="sendInvalidBip44Test"
          data-testid="send-invalid-test"
          onClick={handleClick('getAccount', 3)}
          disabled={isLoading}
        >
          Send Invalid
        </Button>
      </ButtonGroup>
      <Result className="mb-3">
        <span id="bip44Result" data-testid="test-result">
          {JSON.stringify(data, null, 2)}
        </span>
      </Result>

      <SignMessage />
    </Snap>
  );
};
