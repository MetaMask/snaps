import { Box, Flex, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

import { TRANSACTION_PRESETS } from '../presets';
import { TransactionFormData } from '../utils';
import { TransactionPrefill } from './TransactionPrefill';

export type TransactionPrefillsProps = {
  onClick: (prefill: TransactionFormData) => void;
};

export const TransactionPrefills: FunctionComponent<
  TransactionPrefillsProps
> = ({ onClick }) => (
  <Box marginBottom="4">
    <Text fontWeight="500" fontSize="xs" marginBottom="1">
      Transaction presets
    </Text>
    <Flex gap="2">
      {TRANSACTION_PRESETS.map(({ name, transaction }, index) => (
        <TransactionPrefill
          name={name}
          {...transaction}
          key={`transaction-prefill-${index}`}
          onClick={onClick}
        />
      ))}
    </Flex>
  </Box>
);
