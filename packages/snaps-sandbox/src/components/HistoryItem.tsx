import { Editable, List } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import type { FunctionComponent, MouseEvent } from 'react';

import { HistoryItemMenu } from './HistoryItemMenu';
import { RelativeTime } from './RelativeTime';
import type { HistoryEntry } from '../state';
import { historyAtom, requestAtom } from '../state';

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
  const dispatch = useSetAtom(historyAtom);
  const setValue = useSetAtom(requestAtom);

  const handleClick = () => {
    setValue(entry.request);
  };

  const handleClickInput = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleChange = ({
    value,
  }: Parameters<
    Exclude<Editable.RootProps['onValueChange'], undefined>
  >[0]) => {
    dispatch({
      type: 'update',
      payload: {
        ...entry,
        title: value,
      },
    });
  };

  return (
    <List.Item
      data-testid="history-item"
      onClick={handleClick}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      padding="2"
      gap="2"
      _hover={{
        cursor: 'pointer',
        backgroundColor: 'info.muted',
        color: 'info.default',
        borderRadius: 'md',
      }}
    >
      <Editable.Root
        fontSize="md"
        activationMode="click"
        defaultValue={entry.title}
        onValueChange={handleChange}
      >
        <Editable.Preview onClick={handleClickInput} paddingX="2" />
        <Editable.Input aria-label="Request title" />
      </Editable.Root>
      <RelativeTime
        className="relative-time"
        flexShrink="0"
        fontSize="md"
        lineHeight="100%"
        color="text.secondary"
        time={new Date(entry.timestamp)}
      />
      <HistoryItemMenu className="history-item" entry={entry} />
    </List.Item>
  );
};
