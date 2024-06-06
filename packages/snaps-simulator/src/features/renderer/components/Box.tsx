import { Box as ChakraBox } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { SnapComponent } from '../SnapComponent';

export type BoxProps = {
  id: string;
  node: unknown;
};

export const Box: FunctionComponent<BoxProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Box', 'Expected value to be a Box component.');
  return (
    <ChakraBox key={id}>
      {getJsxChildren(node).map((child, index) => (
        <SnapComponent
          node={child as JSXElement}
          key={`${id}-panel-child-${index}`}
        />
      ))}
    </ChakraBox>
  );
};
