import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Container } from '@metamask/snaps-sdk/jsx';

import { SendFlowFooter } from './SendFlowFooter';
import { SendFlowHeader } from './SendFlowHeader';
import { SendForm } from './SendForm';
import { TransactionSummary } from './TransactionSummary';
import type { Account, Currency } from '../types';

/**
 * The props for the {@link SendFlow} component.
 *
 * @property accounts - The available accounts.
 * @property selectedAccount - The currently selected account.
 * @property selectedCurrency - The selected currency to display.
 * @property total - The total cost of the transaction.
 * @property fees - The fees for the transaction.
 * @property flushToAddress - Whether to flush the address field or not.
 * @property errors - The form errors.
 */
export type SendFlowProps = {
  accounts: Account[];
  selectedAccount: string;
  selectedCurrency: 'BTC' | '$';
  total: Currency;
  fees: Currency;
  flushToAddress?: boolean;
  errors?: {
    amount?: string;
    to?: string;
  };
};

/**
 * A send flow component, which shows the user a form to send funds to another.
 *
 * @param props - The component props.
 * @param props.accounts - The available accounts.
 * @param props.selectedAccount - The currently selected account.
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.total - The total cost of the transaction.
 * @param props.errors - The form errors.
 * @param props.fees - The fees for the transaction.
 * @param props.flushToAddress - Whether to flush the address field or not.
 * @returns The SendFlow component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  accounts,
  selectedAccount,
  selectedCurrency,
  total,
  fees,
  flushToAddress,
  errors,
}) => {
  return (
    <Container>
      <Box>
        <SendFlowHeader />
        <SendForm
          selectedAccount={selectedAccount}
          accounts={accounts}
          selectedCurrency={selectedCurrency}
          flushToAddress={flushToAddress}
          errors={errors}
        />
        <TransactionSummary fees={fees} total={total} />
      </Box>
      <SendFlowFooter />
    </Container>
  );
};
