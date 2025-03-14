import type {
  CaipChainId,
  CaipAssetType,
  CaipAccountId,
} from '@metamask/utils';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AssetSelector} component.
 *
 * @property name - The name of the asset selector. This is used to identify the
 * state in the form data.
 * @property addresses - The addresses of the account to pull the assets from as CAIP-10 Account IDs.
 * Multiple CAIP-10 Account IDs can be provided, but the account address should be the same on all Account IDs.
 * Only non-EIP-155 namespaces are supported for now.
 * @property chainIds - The chain IDs to filter the assets.
 * Only non-EIP-155 namespaces are supported for now.
 * @property value - The selected value of the asset selector.
 * Only non-EIP-155 namespaces are supported for now.
 * @property disabled - Whether the asset selector is disabled.
 */
export type AssetSelectorProps = {
  name: string;
  addresses: CaipAccountId[];
  chainIds?: CaipChainId[] | undefined;
  value?: CaipAssetType | undefined;
  disabled?: boolean | undefined;
};

const TYPE = 'AssetSelector';

/**
 * An asset selector component, which is used to create an asset selector.
 *
 * @param props - The props of the component.
 * @property addresses - The addresses of the account to pull the assets from as CAIP-10 Account IDs.
 * Multiple CAIP-10 Account IDs can be provided, but the account address should be the same on all Account IDs.
 * Only non-EIP-155 namespaces are supported for now.
 * @param props.chainIds - The chain IDs to filter the assets.
 * Only non-EIP-155 namespaces are supported for now.
 * @param props.value - The selected value of the asset selector.
 * Only non-EIP-155 namespaces are supported for now.
 * @param props.disabled - Whether the asset selector is disabled.
 * @returns An asset selector element.
 * @example
 * <AssetSelector
 *  addresses={[
 *    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
 *    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
 *  ]}
 *  value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
 * />
 * @example
 * <AssetSelector
 *  addresses={[
 *    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
 *    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
 *  ]}
 *  chainIds={['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']}
 * />
 */
export const AssetSelector = createSnapComponent<
  AssetSelectorProps,
  typeof TYPE
>(TYPE);

export type AssetSelectorElement = ReturnType<typeof AssetSelector>;
