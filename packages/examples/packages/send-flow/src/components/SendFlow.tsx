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
 * @property accounts - The available accounts.
 * @property total - The total cost of the transaction.
 * @property useFiat - Whether to use fiat currency.
 * @property fees - The fees for the transaction.
 * @property errors - The form errors.
 * @property displayAvatar - Whether to display the avatar of the address.
 */
export type SendFlowProps = {
  account?: AccountSelectorState;
  asset?: AssetSelectorState;
  useFiat: boolean;
  fiatCurrency: string;
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
 * @param props.account - The account to use.
 * @param props.asset - The asset to use.
 * @param props.useFiat - Whether to use fiat currency.
 * @param props.fiatCurrency - The fiat currency to use.
 * @param props.total - The total cost of the transaction.
 * @param props.errors - The form errors.
 * @param props.fees - The fees for the transaction.
 * @param props.displayAvatar - Whether to display the avatar of the address.
 * @returns The SendFlow component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  account,
  asset,
  useFiat,
  fiatCurrency,
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
          account={account}
          fiatCurrency={fiatCurrency}
          asset={asset}
          useFiat={useFiat}
          errors={errors}
          displayAvatar={displayAvatar}
        />
        <TransactionSummary fees={fees} total={total} />
      </Box>
      <SendFlowFooter />
    </Container>
  );
};
