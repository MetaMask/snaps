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

export type Account = {
  name: string;
  address: string;
  balance: number;
  fiatBalance: number;
  icon: string;
};

export type Total = {
  amount: number;
  fiat: number;
};

/**
 * The props for the {@link SendFlow} component.
 *
 * @property address - The current address.
 */
export type SendFlowProps = {
  accounts: Account[];
  selectedAccount: string;
  selectedCurrency: 'BTC' | '$';
  total: Total;
  fees: Total;
  toAddress: string | null;
  errors?: {
    amount?: string;
    to?: string;
  };
};

/**
 * Truncate a string to a given length.
 *
 * @param str - The string to truncate.
 * @param length - The number of characters to truncate the string to.
 * @returns The truncated string.
 */
function truncate(str: string, length: number): string {
  return str.length > length
    ? `${str.slice(0, 5)}...${str.slice(str.length - 5, str.length)}`
    : str;
}

/**
 * A counter component, which shows the current count, and a button to increment
 * it by one.
 *
 * @param props - The component props.
 * @param props.accounts - The available accounts.
 * @param props.selectedAccount - The currently selected account.
 * @param props.selectedCurrency - The selected currency to display.
 * @param props.total - The total cost of the transaction.
 * @param props.toAddress - The receiving address.
 * @param props.errors - The form errors.
 * @param props.fees
 * @returns The counter component.
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
        <Box direction="horizontal" alignment="space-between" center>
          <Button name="back">
            <Icon name="arrow-left" color="primary" size="md" />
          </Button>
          <Heading>Send</Heading>
          <Button name="menu">
            <Icon name="more-vertical" color="primary" size="md" />
          </Button>
        </Box>
        <Form name="sendForm">
          <Field label={'From account'}>
            <Selector
              name="accountSelector"
              title="From account"
              value={selectedAccount}
            >
              {accounts.map(({ name, address, balance, fiatBalance, icon }) => (
                <SelectorOption value={address}>
                  <Card
                    image={icon}
                    title={name}
                    description={truncate(address, 13)}
                    value={`${balance.toString()} BTC`}
                    extra={`$${fiatBalance}`}
                  />
                </SelectorOption>
              ))}
            </Selector>
          </Field>
          <Field label="Send amount" error={errors?.amount}>
            <Box>
              <Image src={btcIcon} />
            </Box>
            <Input
              name="amount"
              type="number"
              placeholder="Enter amount to send"
            />
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
                  <Icon name="close" size="md" color="primary" />
                </Button>
              </Box>
            )}
          </Field>
        </Form>
        <Section>
          <Row label="Estimated network fee">
            <Value value="1.0001 BTC" extra="$1.23" />
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
      </Box>
      <Footer>
        <Button name="review">Review</Button>
      </Footer>
    </Container>
  );
};
