import {
  Row,
  Section,
  Text,
  Value,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

import type { Currency } from '../types';

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
