import { Box } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Renderer } from '../Renderer';

export type PanelProps = {
  id: string;
  node: unknown;
};

export const Panel: FunctionComponent<PanelProps> = ({ node, id }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(node.type === 'panel', 'Expected value to be a panel component.');

  return (
    <Box key={`${id}-panel`}>
      {node.children.map((child, index) => (
        <Renderer
          key={`${id}-panel-child-${index}`}
          id={`${id}-panel-child-${index}`}
          node={child}
        />
      ))}
    </Box>
  );
};
