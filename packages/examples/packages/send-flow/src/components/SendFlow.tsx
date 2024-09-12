import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Bold,
  Button,
  Box,
  Text,
  Tooltip,
  Card,
  Container,
  Footer,
  Selector,
  SelectorOption,
  Divider,
  Form,
  Field,
  Input,
  Image,
  Icon,
  Section,
  Row,
  Value,
} from '@metamask/snaps-sdk/jsx';

import btcIcon from '../images/btc.svg';
import jazzIcon from '../images/jazzicon.svg';

export type Account = {
  name: string;
  address: string;
  balance: number;
  fiatBalance: number;
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
 * @returns The counter component.
 */
export const SendFlow: SnapComponent<SendFlowProps> = ({
  accounts,
  selectedAccount,
  selectedCurrency,
  total,
}) => {
  return (
    <Container>
      <Box>
        <Form name="sendForm">
          <Field label={'From account'}>
            <Selector
              name="accountSelector"
              title="From account"
              value={selectedAccount}
            >
              {accounts.map(({ name, address, balance, fiatBalance }) => (
                <SelectorOption value={address}>
                  <Card
                    image={jazzIcon}
                    title={name}
                    description={truncate(address, 13)}
                    value={`${balance.toString()} BTC`}
                    extra={`$${fiatBalance}`}
                  />
                </SelectorOption>
              ))}
            </Selector>
          </Field>
          <Divider />
          <Field label="Send amount">
            <Box>
              <Image src={btcIcon} />
            </Box>
            <Input name="amount" type="number" />
            <Box direction="horizontal" alignment="center">
              <Text>{selectedCurrency}</Text>
              <Button name="swap">
                <Icon name="swap-vertical" color="primary" />
              </Button>
            </Box>
          </Field>
          <Field label="To account">
            <Input name="to" />
            <Box>
              <Button name="clear">
                <Icon name="close" />
              </Button>
            </Box>
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
