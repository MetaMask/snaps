import { Flex, Text } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { Icon } from '../../../components';

export type CopyableProps = {
  id: string;
  node: unknown;
};

export const Copyable: FunctionComponent<CopyableProps> = ({ node, id }) => {
  const [copied, setCopied] = useState(false);

  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(
    node.type === 'copyable',
    'Expected value to be a copyable component.',
  );

  const handleClick = () => {
    navigator.clipboard
      .writeText(node.value)
      .then(() => {
        setCopied(true);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <Flex
      padding="2"
      borderRadius="md"
      background="background.alternative"
      justifyContent="space-between"
      marginBottom="1"
      key={`${id}-copyable`}
      wordBreak="break-word"
    >
      <Text
        fontFamily="custom"
        color="text.alternative"
        fontSize="sm"
        lineHeight="157%"
      >
        {node.value}
      </Text>
      <Icon
        icon={copied ? 'copied' : 'copy'}
        width="15px"
        cursor="pointer"
        onClick={handleClick}
      />
    </Flex>
  );
};
