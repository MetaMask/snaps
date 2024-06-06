import { Link as ChakraLink } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Icon } from '../../../components';
import { renderTextChildren } from '../../../utils';

export type LinkProps = {
  id: string;
  node: unknown;
};

export const Link: FunctionComponent<LinkProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Link', 'Expected value to be a link component.');

  const { props } = node;
  return (
    <ChakraLink
      href={props.href}
      target="_blank"
      fontFamily="custom"
      fontSize="sm"
      isExternal
      color="link.default"
      display="inline"
    >
      {renderTextChildren(getJsxChildren(node), id)}
      <Icon
        icon="linkOut"
        width="14px"
        marginLeft="2px"
        display="inline"
        verticalAlign="middle"
      />
    </ChakraLink>
  );
};
