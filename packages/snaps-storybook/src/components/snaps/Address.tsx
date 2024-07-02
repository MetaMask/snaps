import { Flex, Text } from '@chakra-ui/react';
import type { AddressProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { Jazzicon } from '../Jazzicon';

/**
 * Get a truncated version of the address.
 *
 * @param address - The address to truncate.
 * @returns The truncated address.
 */
function getTruncatedAddress(address: string): string {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

/**
 * The address component. See {@link AddressProps} for the props.
 *
 * @param props - The address props.
 * @param props.address - The address to display.
 * @returns The rendered address.
 */
export const Address: FunctionComponent<AddressProps> = ({ address }) => {
  return (
    <Flex gap="2">
      <Jazzicon size={16} address={address} />
      <Text>{getTruncatedAddress(address)}</Text>
    </Flex>
  );
};
