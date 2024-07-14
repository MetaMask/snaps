import { Heading as ChakraHeading } from '@chakra-ui/react';
import type { HeadingProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The heading component. See {@link HeadingProps} for the props.
 *
 * @param props - The heading props.
 * @param props.children - The heading content.
 * @param props.Renderer - The Renderer component to use to render nested
 * elements.
 * @returns The rendered heading.
 */
export const Heading: FunctionComponent<RenderProps<HeadingProps>> = ({
  children,
  Renderer,
}) => {
  return (
    <ChakraHeading>
      <Renderer id="heading" element={children} />
    </ChakraHeading>
  );
};
