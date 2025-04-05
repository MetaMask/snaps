import { Bleed, Heading, List, Stack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import type { FunctionComponent } from 'react';

import { HistoryItem } from './HistoryItem';
import { historyAtom } from '../state';

/**
 * A component that displays the previous requests made to the Snap.
 *
 * @returns The history component.
 */
export const History: FunctionComponent = () => {
  const [history] = useAtom(historyAtom);

  return (
    <Stack gap="2">
      <Heading as="h2" size="sm">
        Previous requests
      </Heading>

      <Bleed inline="2">
        <List.Root variant="plain">
          {history.map((entry) => (
            <HistoryItem entry={entry} key={entry.timestamp} />
          ))}
        </List.Root>
      </Bleed>
    </Stack>
  );
};
