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
  type SnapComponent,
  AccountSelector,
  AssetSelector,
} from '@metamask/snaps-sdk/jsx';

import type { SendFormErrors } from '../types';

/**
 * The props for the {@link SendForm} component.
 *
 * @property accounts - The available accounts.
 * @property errors - The form errors.
 * @property selectedCurrency - The selected currency to display.
 * @property displayAvatar - Whether to display the avatar of the address.
 */
export type SendFormProps = {
  account?: AccountSelectorState;
  asset?: AssetSelectorState;
  useFiat: boolean;
  fiatCurrency: string;
  errors?: SendFormErrors;
  displayAvatar?: boolean | undefined;
};

/**
 * A component that shows the send form.
 *
 * @param props - The component props.
 * @param props.account - The account to use.
 * @param props.asset - The asset to use.
 * @param props.errors - The form errors.
 * @param props.displayAvatar - Whether to display the avatar of the address.
 * @param props.useFiat - Whether to use fiat currency.
 * @param props.fiatCurrency - The fiat currency to use.
 * @returns The SendForm component.
 */
export const SendForm: SnapComponent<SendFormProps> = ({
  account,
  asset,
  errors,
  displayAvatar,
  fiatCurrency,
  useFiat,
}) => {
  const currencySymbol = useFiat
    ? fiatCurrency.toUpperCase()
    : (asset?.symbol ?? 'SOL');

  return (
    <Form name="sendForm">
      <AccountSelector
        switchGlobalAccount
        name="account"
        chainIds={[
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        ]}
      />
      <Box direction="horizontal">
        {account ? (
          <Field label="Asset">
            <AssetSelector
              name="asset"
              addresses={account.addresses}
              chainIds={[
                'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
                'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
              ]}
            />
          </Field>
        ) : null}
        <Field label="Send amount" error={errors?.amount}>
          <Input
            name="amount"
            type="number"
            placeholder="Enter amount to send"
          />
          <Box direction="horizontal" center>
            <Text color="alternative">{currencySymbol}</Text>
            <Button name="swap">
              <Icon name="swap-vertical" color="primary" size="md" />
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
};
