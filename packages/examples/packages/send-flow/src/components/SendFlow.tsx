import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Container } from '@metamask/snaps-sdk/jsx';

import type { Currency } from '../types';
import { SendFlowFooter } from './SendFlowFooter';
import { SendFlowHeader } from './SendFlowHeader';
import { SendForm } from './SendForm';
import { TransactionSummary } from './TransactionSummary';

/**
 * The props for the {@link SendFlow} component.
 *
 * @property selectedCurrency - The selected currency to display.
 * @property total - The total cost of the transaction.
 * @property fees - The fees for the transaction.
 * @property displayClearIcon - Whether to display the clear icon or not.
 * @property flushToAddress - Whether to flush the address field or not.
 * @property errors - The form errors.
 */
export type SendFlowProps = {
  selectedCurrency: 'BTC' | '$';
  total: Currency;
  fees: Currency;
  displayClearIcon: boolean;
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
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.total - The total cost of the transaction.
 * @param props.errors - The form errors.
 * @param props.fees - The fees for the transaction.
 * @param props.displayClearIcon - Whether to display the clear icon or not.
 * @param props.flushToAddress - Whether to flush the address field or not.
 * @returns The SendFlow component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  selectedCurrency,
  total,
  fees,
  displayClearIcon,
  flushToAddress,
  errors,
}) => {
  return (
    <Container>
      <Box>
        <SendFlowHeader />
        <SendForm
          selectedCurrency={selectedCurrency}
          flushToAddress={flushToAddress}
          displayClearIcon={displayClearIcon}
          errors={errors}
        />
        <TransactionSummary fees={fees} total={total} />
      </Box>
      <SendFlowFooter />
    </Container>
  );
};
