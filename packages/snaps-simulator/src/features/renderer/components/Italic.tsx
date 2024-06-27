import { Text } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { renderTextChildren } from '../../../utils';

export type ItalicProps = {
  id: string;
  node: unknown;
};

export const Italic: FunctionComponent<ItalicProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Italic', 'Expected value to be an italic component.');

  return (
    <Text key={id} fontFamily="custom" fontSize="sm" paddingBottom="1" as="i">
      {renderTextChildren(getJsxChildren(node), id)}
    </Text>
  );
};
