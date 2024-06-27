import { Text } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { renderTextChildren } from '../../../utils';

export type BoldProps = {
  id: string;
  node: unknown;
};

export const Bold: FunctionComponent<BoldProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Bold', 'Expected value to be a bold component.');

  return (
    <Text
      key={`${id}-text`}
      fontFamily="custom"
      fontSize="sm"
      paddingBottom="1"
      as="b"
    >
      {renderTextChildren(getJsxChildren(node), id)}
    </Text>
  );
};
