import type {
  AccountSelectorState,
  AssetSelectorState,
} from '@metamask/snaps-sdk';
import {
  Box,
  Button,
  Field,
  Form,
  Icon,
  Input,
  AddressInput,
  Text,
  AccountSelector,
  type SnapComponent,
  AssetSelector,
} from '@metamask/snaps-sdk/jsx';

import type { SendFormErrors } from '../types';

/**
 * The props for the {@link SendForm} component.
 *
 * @property errors - The form errors.
 * @property selectedCurrency - The selected currency to display.
 * @property displayAvatar - Whether to display the avatar of the address.
 */
export type SendFormProps = {
  useFiat: boolean;
  errors?: SendFormErrors;
  account: AccountSelectorState | null;
  asset: AssetSelectorState | null;
  displayAvatar?: boolean | undefined;
};

/**
 * A component that shows the send form.
 *
 * @param props - The component props.
 * @param props.errors - The form errors.
 * @param props.displayAvatar - Whether to display the avatar of the address.
 * @param props.account - The account state.
 * @param props.asset - The asset state.
 * @param props.useFiat - Whether to use fiat currency.
 * @returns The SendForm component.
 */
export const SendForm: SnapComponent<SendFormProps> = ({
  errors,
  useFiat,
  account,
  asset,
  displayAvatar,
}) => (
  <Form name="sendForm">
    <Field label="From account">
      <AccountSelector
        name="account"
        switchGlobalAccount
        chainIds={[
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        ]}
      />
    </Field>
    <Box direction="horizontal">
      {account ? (
        <Field label="Asset">
          <AssetSelector name="asset" addresses={account.addresses} />
        </Field>
      ) : null}
      <Field label="Send amount" error={errors?.amount}>
        <Input name="amount" type="number" placeholder="Enter amount to send" />
        <Box direction="horizontal" center>
          <Text color="alternative" size="sm">
            {useFiat ? '$' : (asset?.symbol ?? 'SOL')}
          </Text>
          <Button name="swap" size="sm">
            <Icon name="swap-vertical" color="primary" size="inherit" />
          </Button>
        </Box>
      </Field>
    </Box>
    <Field label="To account" error={errors?.to}>
      <AddressInput
        name="to"
        chainId="eip155:0"
        placeholder="Enter receiving address"
        displayAvatar={displayAvatar}
      />
    </Field>
  </Form>
);
