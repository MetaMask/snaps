import { Box as ChakraBox } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Renderer } from '../Renderer';

export type BoxProps = {
  id: string;
  node: unknown;
};

export const Box: FunctionComponent<BoxProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Box', 'Expected value to be a Box component.');

  return (
    <ChakraBox key={`${id}-panel`}>
      {getJsxChildren(node).map((child, index) => (
        <Renderer
          key={`${id}-panel-child-${index}`}
          id={`${id}-panel-child-${index}`}
          node={child as JSXElement}
        />
      ))}
    </ChakraBox>
  );
};
