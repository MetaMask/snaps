import type { CaipAccountId, CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AccountSelector} component.
 *
 * @property name - The name of the account selector. This is used to identify the
 * state in the form data.
 * @property hideExternalAccounts - Whether to hide accounts that doesn't belong to the snap.
 * @property chainIds - The chain IDs to filter the accounts to show.
 * @property switchSelectedAccount - Whether to switch the selected account in the client.
 * @property selectedAddress - The selected address.
 */
export type AccountSelectorProps = {
  name: string;
  hideExternalAccounts?: boolean | undefined;
  chainIds?: CaipChainId[] | undefined;
  switchSelectedAccount?: boolean | undefined;
  selectedAddress?: CaipAccountId | undefined;
};

const TYPE = 'AccountSelector';

/**
 * An account selector component, which is used to create an account selector.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the account selector. This is used to identify the
 * state in the form data.
 * @param props.hideExternalAccounts - Whether to hide accounts that doesn't belong to the snap.
 * @param props.chainIds - The chain IDs to filter the accounts to show.
 * @param props.switchSelectedAccount - Whether to switch the selected account in the client.
 * @param props.selectedAddress - The selected address.
 * @returns An account selector element.
 * @example
 * <AccountSelector name="account-selector" />
 * @example
 * <AccountSelector name="account-selector" hideExternalAccounts />
 * @example
 * <AccountSelector name="account-selector" chainIds={['eip155:1']} />
 * @example
 * <AccountSelector name="account-selector" switchSelectedAccount />
 * @example
 * <AccountSelector name="account-selector" selectedAddress="eip155:1:0x1234..." />
 * @example
 * <AccountSelector name="account-selector" hideExternalAccounts chainIds={['eip155:1']} switchSelectedAccount selectedAddress="eip155:1:0x1234..." />
 */
export const AccountSelector = createSnapComponent<
  AccountSelectorProps,
  typeof TYPE
>(TYPE);

/**
 * An account selector element.
 *
 * @see AccountSelector
 */
export type AccountSelectorElement = ReturnType<typeof AccountSelector>;
