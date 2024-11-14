import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import { LEDGER_SNAP_ID, LEDGER_SNAP_PORT, LEDGER_VERSION } from './constants';

export const Ledger: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(LEDGER_SNAP_ID, LEDGER_SNAP_PORT),
      method: 'request',
    }).catch(logError);
  };

  return (
    <Snap
      name="Ledger Snap"
      snapId={LEDGER_SNAP_ID}
      port={LEDGER_SNAP_PORT}
      version={LEDGER_VERSION}
      testId="ledger"
    >
      <Button
        variant="primary"
        id="displayLedger"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Show Ledger dialog
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
