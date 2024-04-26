import { Text as ChakraText, Link as ChakraLink } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';
import ReactMarkdown from 'react-markdown';

import { Icon } from '../../../components';

export type TextProps = {
  id: string;
  node: unknown;
};

export const Text: FunctionComponent<TextProps> = ({ node, id }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(node.type === 'text', 'Expected value to be a text component.');

  return (
    <ReactMarkdown
      allowedElements={['p', 'strong', 'em', 'a']}
      components={{
        p: ({ children: value }) => (
          <ChakraText fontFamily="custom" fontSize="sm" paddingBottom="1">
            {value}
          </ChakraText>
        ),
        // TODO: Update styling - https://github.com/MetaMask/snaps/issues/1881
        a: ({ children: value, href }) => (
          <ChakraLink
            href={href}
            target="_blank"
            fontFamily="custom"
            fontSize="sm"
            isExternal
            color="link.default"
            display="inline"
          >
            {value}
            <Icon
              icon="linkOut"
              width="14px"
              marginLeft="2px"
              display="inline"
              verticalAlign="middle"
            />
          </ChakraLink>
        ),
      }}
      key={`${id}-text`}
    >
      {node.value}
    </ReactMarkdown>
  );
};
