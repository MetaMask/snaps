import { assert } from '@metamask/utils';
import { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { useLazyGetAccountsQuery, useLazyRequestQuery } from '../../api';
import { Snap, Result } from '../../components';

const INSIGHTS_SNAP_ID = 'npm:@metamask/test-snap-insights';
const INSIGHTS_SNAP_PORT = 8008;

export const Insights: FunctionComponent = () => {
  const [getAccounts, { isLoading: isLoadingAccounts, data: accounts }] =
    useLazyGetAccountsQuery();
  const [request, { isLoading: isLoadingRequest, data: transaction, error }] =
    useLazyRequestQuery();

  const isLoading = isLoadingAccounts || isLoadingRequest;

  const handleGetAccounts = () => {
    getAccounts();
  };

  const handleSendTransaction = () => {
    assert(accounts?.length);

    const account = accounts[0];
    request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: account,
          to: account,
          value: '0x0',
          data: '0x1',
        },
      ],
    });
  };

  return (
    <Snap
      name="Insights Snap"
      snapId={INSIGHTS_SNAP_ID}
      port={INSIGHTS_SNAP_PORT}
      testId="InsightsSnap"
    >
      <ButtonGroup>
        <Button
          variant="primary"
          id="getAccounts"
          className="mb-3"
          disabled={isLoading}
          onClick={handleGetAccounts}
        >
          Get Accounts
        </Button>
        <Button
          variant="primary"
          id="sendInsights"
          className="mb-3"
          disabled={isLoading || !accounts?.length}
          onClick={handleSendTransaction}
        >
          Send Transaction
        </Button>
      </ButtonGroup>
      <Result>
        <span id="insightsResult">
          {JSON.stringify(transaction, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
