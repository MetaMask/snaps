import type { CaipAccountId } from '@metamask/utils';

import { createSnapComponent } from '../component';

/**
 * The props of the {@link Avatar} component.
 *
 * @property address - The address to display. This should be a valid CAIP-10 address.
 * @property size - The size of the avatar. Can be `sm`, `md`, or `lg`. Defaults to `md`.
 * @category Component Props
 */
export type AvatarProps = {
  address: CaipAccountId;
  size?: 'sm' | 'md' | 'lg' | undefined;
};

const TYPE = 'Avatar';

/**
 * An avatar component, which is used to display an avatar for a CAIP-10 address.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.address - The address to display. This should be a valid CAIP-10 address.
 * @param props.size - The size of the avatar. Can be `sm`, `md`, or `lg`. Defaults to `md`.
 * @returns An avatar element.
 * @example
 * <Avatar address="eip155:1:0x1234567890123456789012345678901234567890" />
 * @example
 * <Avatar address="bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6" />
 * @category Components
 */
export const Avatar = createSnapComponent<AvatarProps, typeof TYPE>(TYPE);

/**
 * An avatar element.
 *
 * @see {@link Avatar}
 * @category Elements
 */
export type AvatarElement = ReturnType<typeof Avatar>;
