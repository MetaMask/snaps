import { List, Text } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import type { FunctionComponent } from 'react';

import { RelativeTime } from './RelativeTime';
import type { HistoryEntry } from '../state';
import { requestAtom } from '../state';

/**
 * The props for the {@link HistoryItem} component.
 */
export type HistoryItemProps = {
  /**
   * The history entry to display.
   */
  entry: HistoryEntry;
};

/**
 * A component that displays a single entry in the history list.
 *
 * @param props - The component props.
 * @param props.entry - The history entry to display.
 * @returns The history item component.
 */
export const HistoryItem: FunctionComponent<HistoryItemProps> = ({ entry }) => {
  const setValue = useSetAtom(requestAtom);

  const handleClick = () => {
    setValue(entry.request);
  };

  return (
    <List.Item
      onClick={handleClick}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      padding="2"
      _hover={{
        cursor: 'pointer',
        backgroundColor: 'info.muted',
        color: 'info.default',
        borderRadius: 'md',
      }}
    >
      <Text fontSize="md" lineHeight="100%">
        {entry.title}
      </Text>
      <RelativeTime
        fontSize="md"
        lineHeight="100%"
        color="text.secondary"
        time={new Date(entry.timestamp)}
      />
    </List.Item>
  );
};
