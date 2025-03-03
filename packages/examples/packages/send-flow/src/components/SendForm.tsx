import {
  Box,
  Button,
  Field,
  Form,
  Icon,
  Image,
  Input,
  AddressInput,
  Text,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

import { AccountSelector } from './AccountSelector';
import btcIcon from '../images/btc.svg';
import type { Account, SendFormErrors } from '../types';

/**
 * The props for the {@link SendForm} component.
 *
 * @property selectedAccount - The currently selected account.
 * @property accounts - The available accounts.
 * @property errors - The form errors.
 * @property selectedCurrency - The selected currency to display.
 * @property flushToAddress - Whether to flush the address field or not.
 */
export type SendFormProps = {
  selectedAccount: string;
  accounts: Account[];
  errors?: SendFormErrors;
  selectedCurrency: 'BTC' | '$';
  flushToAddress?: boolean;
};

/**
 * A component that shows the send form.
 *
 * @param props - The component props.
 * @param props.selectedAccount - The currently selected account.
 * @param props.accounts - The available accounts.
 * @param props.errors - The form errors.
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.flushToAddress - Whether to flush the address field or not.
 * @returns The SendForm component.
 */
export const SendForm: SnapComponent<SendFormProps> = ({
  selectedAccount,
  accounts,
  errors,
  selectedCurrency,
  flushToAddress,
}) => (
  <Form name="sendForm">
    <AccountSelector selectedAccount={selectedAccount} accounts={accounts} />
    <Field label="Send amount" error={errors?.amount}>
      <Box>
        <Image src={btcIcon} />
      </Box>
      <Input name="amount" type="number" placeholder="Enter amount to send" />
      <Box direction="horizontal" center>
        <Text color="alternative">{selectedCurrency}</Text>
        <Button name="swap">
          <Icon name="swap-vertical" color="primary" size="md" />
        </Button>
      </Box>
    </Field>
    <Field label="To account" error={errors?.to}>
      <AddressInput
        name="to"
        chainId="eip155:0"
        placeholder="Enter receiving address"
        value={flushToAddress ? '' : undefined}
      />
    </Field>
  </Form>
);
