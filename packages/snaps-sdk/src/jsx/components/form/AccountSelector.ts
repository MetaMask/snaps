import type { CaipAccountId, CaipChainId } from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AccountSelector} component.
 *
 * @property name - The name of the account selector. This is used to identify the
 * state in the form data.
 * @property hideExternalAccounts - Whether to hide accounts that don't belong to the snap.
 * @property chainIds - The chain IDs to filter the accounts to show.
 * @property switchGlobalAccount - Whether to switch the selected account in the client.
 * @property disabled - Whether the account selector is disabled.
 * @property value - The selected address.
 */
export type AccountSelectorProps = {
  name: string;
  hideExternalAccounts?: boolean | undefined;
  chainIds?: CaipChainId[] | undefined;
  switchGlobalAccount?: boolean | undefined;
  value?: CaipAccountId | undefined;
  disabled?: boolean | undefined;
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
 * @param props.switchGlobalAccount - Whether to switch the selected account in the client.
 * @param props.value - The selected address.
 * @param props.disabled - Whether the account selector is disabled.
 * @returns An account selector element.
 * @example
 * <AccountSelector name="account-selector" />
 * @example
 * <AccountSelector name="account-selector" hideExternalAccounts />
 * @example
 * <AccountSelector name="account-selector" chainIds={['eip155:1']} />
 * @example
 * <AccountSelector name="account-selector" switchGlobalAccount />
 * @example
 * <AccountSelector name="account-selector" value="eip155:1:0x1234..." />
 * @example
 * <AccountSelector name="account-selector" hideExternalAccounts chainIds={['eip155:1']} switchGlobalAccount value="eip155:1:0x1234..." />
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
