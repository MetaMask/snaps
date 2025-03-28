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
 * @property selectedCurrency - The selected currency to display.
 * @property total - The total cost of the transaction.
 * @property fees - The fees for the transaction.
 * @property errors - The form errors.
 * @property displayAvatar - Whether to display the avatar of the address.
 */
export type SendFlowProps = {
  selectedCurrency: 'BTC' | '$';
  total: Currency;
  fees: Currency;
  errors?: {
    amount?: string;
    to?: string;
  };
  displayAvatar?: boolean | undefined;
};

/**
 * A send flow component, which shows the user a form to send funds to another.
 *
 * @param props - The component props.
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.total - The total cost of the transaction.
 * @param props.errors - The form errors.
 * @param props.fees - The fees for the transaction.
 * @param props.displayAvatar - Whether to display the avatar of the address.
 * @returns The SendFlow component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  selectedCurrency,
  total,
  fees,
  errors,
  displayAvatar,
}) => {
  return (
    <Container>
      <Box>
        <SendFlowHeader />
        <SendForm
          selectedCurrency={selectedCurrency}
          errors={errors}
          displayAvatar={displayAvatar}
        />
        <TransactionSummary fees={fees} total={total} />
      </Box>
      <SendFlowFooter />
    </Container>
  );
};
