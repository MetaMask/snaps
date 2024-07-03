import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import jazzicon from '@metamask/jazzicon';
import type { FunctionComponent } from 'react';
import { useEffect, useRef } from 'react';

/**
 * The props for the {@link Jazzicon} component.
 *
 * @see BoxProps
 */
export type JazziconProps = BoxProps & {
  /**
   * The size of the Jazzicon.
   */
  size?: number;

  /**
   * The Ethereum address to display the Jazzicon for.
   */
  address: string;
};

/**
 * Get a seed from an Ethereum address for the Jazzicon.
 *
 * @param address - The address to get the seed from.
 * @returns The seed for the Jazzicon.
 */
function getAddressSeed(address: string): number {
  const value = address.slice(2, 10);
  return parseInt(value, 16);
}

/**
 * A Jazzicon component, which is used to display a Jazzicon for an Ethereum
 * address.
 *
 * @param props - The props of the component.
 * @param props.size - The size of the Jazzicon.
 * @param props.address - The Ethereum address to display the Jazzicon for.
 * @param props.props - Props to forward to the {@link Box} component.
 * @returns A Jazzicon element.
 */
export const Jazzicon: FunctionComponent<JazziconProps> = ({
  size = 32,
  address,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (ref.current) {
      const element = jazzicon(size, getAddressSeed(address));
      ref.current.appendChild(element);

      return () => {
        ref.current?.removeChild(element);
      };
    }
  }, [ref, address]);

  return <Box ref={ref} {...props} />;
};
