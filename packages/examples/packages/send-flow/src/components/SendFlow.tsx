import type {
  AccountSelectorState,
  AssetSelectorState,
} from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Container } from '@metamask/snaps-sdk/jsx';

import { SendFlowFooter } from './SendFlowFooter';
import { SendFlowHeader } from './SendFlowHeader';
import { SendForm } from './SendForm';
import { TransactionSummary } from './TransactionSummary';
import type { Currency } from '../types';

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
  displayAvatar?: boolean;
  useFiat: boolean;
  account: AccountSelectorState | null;
  asset: AssetSelectorState | null;
  total: Currency;
  fees: Currency;
  errors?: {
    amount?: string;
    to?: string;
  };
};

/**
 * A send flow component, which shows the user a form to send funds to another.
 *
 * @param props - The component props.
 * @param props.total - The total cost of the transaction.
 * @param props.errors - The form errors.
 * @param props.fees - The fees for the transaction.
 * @param props.useFiat - Whether to use fiat currency.
 * @param props.account - The account state.
 * @param props.asset - The asset state.
 * @param props.displayAvatar - Whether to display the avatar of the address.
 * @returns The SendFlow component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  total,
  fees,
  errors,
  useFiat,
  displayAvatar,
  account,
  asset,
}) => {
  return (
    <Container>
      <Box>
        <SendFlowHeader />
        <SendForm
          displayAvatar={displayAvatar}
          useFiat={useFiat}
          account={account}
          asset={asset}
          errors={errors}
        />
        <TransactionSummary fees={fees} total={total} />
      </Box>
      <SendFlowFooter />
    </Container>
  );
};
