import {
  Card,
  Field,
  Selector,
  SelectorOption,
  type SnapComponent,
} from '@metamask/snaps-sdk/jsx';

import type { Account } from '../types';
import { truncate } from '../utils';

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
