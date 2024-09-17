import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Button,
  Box,
  Text,
  Card,
  Container,
  Footer,
  Selector,
  SelectorOption,
  Form,
  Field,
  Input,
  Image,
  Icon,
  Section,
  Row,
  Value,
  Heading,
} from '@metamask/snaps-sdk/jsx';

import btcIcon from '../images/btc.svg';
import jazzicon3 from '../images/jazzicon3.svg';
import type { Account, SendFormErrors, Currency } from '../types';
import { truncate } from '../utils';

/**
 * A component that shows the send flow header.
 *
 * @returns The SendFlowHeader component.
 */
export const SendFlowHeader: SnapComponent = () => (
  <Box direction="horizontal" alignment="space-between" center>
    <Button name="back">
      <Icon name="arrow-left" color="primary" size="md" />
    </Button>
    <Heading>Send</Heading>
    <Button name="menu">
      <Icon name="more-vertical" color="primary" size="md" />
    </Button>
  </Box>
);

/**
 * The props for the {@link AccountSelector} component.
 *
 * @property selectedAccount - The currently selected account.
 * @property accounts - The available accounts.
 */
export type AccountSelectorProps = {
  selectedAccount: string;
  accounts: Account[];
};

/**
 * A component that shows the account selector.
 *
 * @param props - The component props.
 * @param props.selectedAccount - The currently selected account.
 * @param props.accounts - The available accounts.
 * @returns The AccountSelector component.
 */
export const AccountSelector: SnapComponent<AccountSelectorProps> = ({
  selectedAccount,
  accounts,
}) => (
  <Field label={'From account'}>
    <Selector
      name="accountSelector"
      title="From account"
      value={selectedAccount}
    >
      {accounts.map(({ name, address, balance, icon }) => (
        <SelectorOption value={address}>
          <Card
            image={icon}
            title={name}
            description={truncate(address, 13)}
            value={`${balance.amount.toString()} BTC`}
            extra={`$${balance.fiat.toString()}`}
          />
        </SelectorOption>
      ))}
    </Selector>
  </Field>
);

/**
 * The props for the {@link SendForm} component.
 *
 * @property selectedAccount - The currently selected account.
 * @property accounts - The available accounts.
 * @property errors - The form errors.
 * @property selectedCurrency - The selected currency to display.
 * @property toAddress - The receiving address.
 */
export type SendFormProps = {
  selectedAccount: string;
  accounts: Account[];
  errors?: SendFormErrors;
  selectedCurrency: 'BTC' | '$';
  toAddress: string | null;
};

/**
 * A component that shows the send form.
 *
 * @param props - The component props.
 * @param props.selectedAccount - The currently selected account.
 * @param props.accounts - The available accounts.
 * @param props.errors - The form errors.
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.toAddress - The receiving address.
 * @returns The SendForm component.
 */
export const SendForm: SnapComponent<SendFormProps> = ({
  selectedAccount,
  accounts,
  errors,
  selectedCurrency,
  toAddress,
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
      <Box>
        <Image src={jazzicon3} />
      </Box>
      <Input name="to" placeholder="Enter receiving address" />
      {toAddress !== null && toAddress !== '' && (
        <Box>
          <Button name="clear">
            <Icon name="close" color="primary" />
          </Button>
        </Box>
      )}
    </Field>
  </Form>
);

/**
 * The props for the {@link TransactionSummary} component.
 *
 * @property fees - The fees for the transaction.
 * @property total - The total cost of the transaction.
 */
export type TransactionSummaryProps = {
  fees: Currency;
  total: Currency;
};

/**
 * A component that shows the transaction summary.
 *
 * @param props - The component props.
 * @param props.fees - The fees for the transaction.
 * @param props.total - The total cost of the transaction.
 * @returns The TransactionSummary component.
 */
export const TransactionSummary: SnapComponent<TransactionSummaryProps> = ({
  fees,
  total,
}) => (
  <Section>
    <Row label="Estimated network fee">
      <Value
        value={`${fees.amount.toString()} BTC`}
        extra={`$${fees.fiat.toString()}`}
      />
    </Row>
    <Row label="Transaction speed" tooltip="The estimated time of the TX">
      <Text>30m</Text>
    </Row>
    <Row label="Total">
      <Value
        value={`${total.amount.toString()} BTC`}
        extra={`$${total.fiat.toString()}`}
      />
    </Row>
  </Section>
);

/**
 * A component that shows the send flow footer.
 *
 * @returns The SendFlowFooter component.
 */
export const SendFlowFooter: SnapComponent = () => (
  <Footer>
    <Button name="review">Review</Button>
  </Footer>
);

/**
 * The props for the {@link SendFlow} component.
 *
 * @property accounts - The available accounts.
 * @property selectedAccount - The currently selected account.
 * @property selectedCurrency - The selected currency to display.
 * @property total - The total cost of the transaction.
 * @property toAddress - The receiving address.
 * @property errors - The form errors.
 */
export type SendFlowProps = {
  accounts: Account[];
  selectedAccount: string;
  selectedCurrency: 'BTC' | '$';
  total: Currency;
  fees: Currency;
  toAddress: string | null;
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
 * @param props.toAddress - The receiving address.
 * @param props.errors - The form errors.
 * @param props.fees - The fees for the transaction.
 * @returns The SendFlow component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  accounts,
  selectedAccount,
  selectedCurrency,
  total,
  fees,
  toAddress,
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
          toAddress={toAddress}
          errors={errors}
        />
        <TransactionSummary fees={fees} total={total} />
      </Box>
      <SendFlowFooter />
    </Container>
  );
};
