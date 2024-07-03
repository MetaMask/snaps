import { Box } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { Delineator } from '../Delineator';
import { Header } from '../Header';
import type { RenderProps } from '../Renderer';

/**
 * The props for the {@link Extension} component.
 */
export type ExtensionProps = {
  /**
   * The JSX element to render in the extension.
   */
  children: JSXElement;
};

/**
 * The MetaMask extension window as a component. This renders the authorship
 * header and the content of the Snap in the delineator.
 *
 * @param props - The component props.
 * @param props.id - The unique ID to use as key for the renderer.
 * @param props.children - The JSX element to render in the extension.
 * @param props.Renderer - The Renderer component to use to render nested
 * elements.
 * @returns The rendered component.
 */
export const Extension: FunctionComponent<RenderProps<ExtensionProps>> = ({
  id,
  children,
  Renderer,
}) => (
  <Box
    width="360px"
    height="600px"
    background="background.alternative"
    boxShadow="sm"
  >
    <Header />
    <Delineator>
      <Renderer id={`${id}-extension`} element={children} />
    </Delineator>
  </Box>
);
