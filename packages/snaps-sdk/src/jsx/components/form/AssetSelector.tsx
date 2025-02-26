import type { CaipAssetType, CaipChainId } from '@metamask/utils';
import type { MatchingAddressesCaipAccountIdList } from 'src/types';

import { createSnapComponent } from '../../component';

/**
 * The props of the {@link AssetSelector} component.
 *
 * @property name - The name of the asset selector. This is used to identify the
 * state in the form data.
 * @property addresses - The addresses of the account to pull the assets from.
 * Only one address is supported, but different chains can be used.
 * @property chainIds - The chain IDs to filter the assets.
 * @property value - The selected value of the asset selector.
 * @property disabled - Whether the asset selector is disabled.
 */
export type AssetSelectorProps = {
  name: string;
  addresses: MatchingAddressesCaipAccountIdList;
  chainIds?: CaipChainId[] | undefined;
  value?: CaipAssetType | undefined;
  disabled?: boolean | undefined;
};

const TYPE = 'AssetSelector';

/**
 * An asset selector component, which is used to create an asset selector.
 *
 * @param props - The props of the component.
 * @param props.addresses - The addresses of the account to pull the assets from.
 * @param props.chainIds - The chain IDs to filter the assets.
 * @param props.value - The selected value of the asset selector.
 * @param props.disabled - Whether the asset selector is disabled.
 * @returns An asset selector element.
 * @example
 * <AssetSelector
 *  addresses={[
 *    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
 *    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv'
 *  ]}
 *  value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
 * />
 * @example
 * <AssetSelector
 *  addresses={['eip155:0:0x1234567890123456789012345678901234567890']}
 *  chainIds={['eip155:1']}
 * />
 */
export const AssetSelector = createSnapComponent<
  AssetSelectorProps,
  typeof TYPE
>(TYPE);

export type AssetSelectorElement = ReturnType<typeof AssetSelector>;
