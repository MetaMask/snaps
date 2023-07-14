import { Flex } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';

import { Author } from './Author';

type WindowProps = {
  snapName: string;
  snapId: string;
  children: ReactNode;
  showAuthorship?: boolean;
};

/**
 * A MetaMask-like window, with a snap authorship pill.
 *
 * @param props - The props.
 * @param props.snapName - The name of the snap.
 * @param props.snapId - The ID of the snap.
 * @param props.children - The children to render inside the window.
 * @param props.showAuthorship - Show the authorship component.
 * @returns The window component.
 */
export const Window: FunctionComponent<WindowProps> = ({
  snapName,
  snapId,
  children,
  showAuthorship = true,
}) => (
  <Flex
    direction="column"
    boxShadow="lg"
    maxWidth="360px"
    height="600px"
    paddingY="4"
    overflowY="scroll"
  >
    {showAuthorship && <Author snapName={snapName} snapId={snapId} />}
    {children}
  </Flex>
);
