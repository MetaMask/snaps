import {
  Box,
  Button,
  Field,
  Form,
  Icon,
  Image,
  Input,
  Text,
  AccountSelector,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

import btcIcon from '../images/btc.svg';
import jazzicon3 from '../images/jazzicon3.svg';
import type { SendFormErrors } from '../types';

/**
 * The props for the {@link SendForm} component.
 *
 * @property errors - The form errors.
 * @property selectedCurrency - The selected currency to display.
 * @property displayClearIcon - Whether to display the clear icon or not.
 * @property flushToAddress - Whether to flush the address field or not.
 */
export type SendFormProps = {
  errors?: SendFormErrors;
  selectedCurrency: 'BTC' | '$';
  displayClearIcon: boolean;
  flushToAddress?: boolean;
};

/**
 * A component that shows the send form.
 *
 * @param props - The component props.
 * @param props.errors - The form errors.
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.displayClearIcon - Whether to display the clear icon or not.
 * @param props.flushToAddress - Whether to flush the address field or not.
 * @returns The SendForm component.
 */
export const SendForm: SnapComponent<SendFormProps> = ({
  errors,
  selectedCurrency,
  displayClearIcon,
  flushToAddress,
}) => (
  <Form name="sendForm">
    <Field label="From account">
      <AccountSelector name="accountSelector" switchGlobalAccount />
    </Field>
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
      <Box>
        <Image src={jazzicon3} />
      </Box>
      <Input
        name="to"
        placeholder="Enter receiving address"
        value={flushToAddress ? '' : undefined}
      />
      {displayClearIcon && (
        <Box>
          <Button name="clear">
            <Icon name="close" color="primary" />
          </Button>
        </Box>
      )}
    </Field>
  </Form>
);
