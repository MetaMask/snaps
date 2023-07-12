import type { LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

type LinkProps = {
  to: string;
  isExternal?: boolean;
} & ChakraLinkProps &
  RouterLinkProps;

/**
 * A link component for internal links. This component is a wrapper around
 * Chakra's Link component and React Router's Link component, to use both
 * together.
 *
 * @param props - The props of the component.
 * @param props.to - The path to link to.
 * @param props.children - The children of the component.
 * @param props.isExternal - Whether the link is external or not.
 * @returns The link component.
 */
export const Link: FunctionComponent<LinkProps> = ({
  to,
  isExternal = false,
  children,
  ...props
}) => {
  if (isExternal) {
    return (
      <ChakraLink isExternal={true} href={to} {...props}>
        {children}
      </ChakraLink>
    );
  }

  return (
    <ChakraLink as={RouterLink} to={to} {...props}>
      {children}
    </ChakraLink>
  );
};
