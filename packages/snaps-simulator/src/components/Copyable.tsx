import { Flex, Text } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { Icon } from './Icon';

export type CopyableProps = {
  value: string;
};

export const Copyable: FunctionComponent<CopyableProps> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard
      .writeText(value)
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
      wordBreak="break-word"
    >
      <Text
        fontFamily="custom"
        color="text.alternative"
        fontSize="sm"
        lineHeight="157%"
      >
        {value}
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
