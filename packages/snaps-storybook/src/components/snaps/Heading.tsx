import { Heading as ChakraHeading } from '@chakra-ui/react';
import type { HeadingProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../Renderer';
import { Renderer } from '../Renderer';

/**
 * The heading component. See {@link HeadingProps} for the props.
 *
 * @param props - The heading props.
 * @param props.id - The unique ID to use as key for the renderer.
 * @param props.children - The heading content.
 * @returns The rendered heading.
 */
export const Heading: FunctionComponent<RenderProps<HeadingProps>> = ({
  id,
  children,
}) => {
  return (
    <ChakraHeading>
      <Renderer id={`${id}-heading`} element={children} />
    </ChakraHeading>
  );
};
