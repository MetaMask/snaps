import { Flex } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Navigation } from '../../navigation';
import { Bottom } from '../../navigation/components';

/**
 * The sidebar component, which holds the navigation buttons, etc.
 *
 * @returns The sidebar component.
 */
export const Sidebar: FunctionComponent = () => (
  <Flex width="375px" borderRight="muted" flexShrink="0" flexDirection="column">
    <Navigation />
    <Bottom />
  </Flex>
);
