import { Text as ChakraText } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { renderTextChildren } from '../../../utils';

export type TextProps = {
  id: string;
  node: unknown;
};

export const Text: FunctionComponent<TextProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Text', 'Expected value to be a text component.');

  return (
    <ChakraText key={id} fontFamily="custom" fontSize="sm" paddingBottom="1">
      {renderTextChildren(getJsxChildren(node), id)}
    </ChakraText>
  );
};
