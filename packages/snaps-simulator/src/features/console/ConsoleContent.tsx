import { Text } from '@chakra-ui/react';

import { useSelector } from '../../hooks';
import { ConsoleEntryType, getConsoleEntries } from './slice';

export const ConsoleContent = () => {
  const entries = useSelector(getConsoleEntries);

  const colors = {
    [ConsoleEntryType.Log]: 'text.console',
    [ConsoleEntryType.Error]: 'text.error',
  };

  return (
    <>
      {entries.map((entry) => (
        <Text
          textColor={colors[entry.type]}
          fontFamily="code"
          fontSize="xs"
          key={entry.date}
          whiteSpace="pre-wrap"
        >
          {entry.message}
        </Text>
      ))}
    </>
  );
};
