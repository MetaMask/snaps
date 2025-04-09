import { Bleed, Heading, List, Stack } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import type { FunctionComponent } from 'react';
import { useMemo } from 'react';

import { HistoryItem } from './HistoryItem';
import type { HistoryEntry } from '../../../state';
import { historyAtom } from '../../../state';

/**
 * A component that displays the previous requests made to the Snap.
 *
 * @returns The history component.
 */
export const History: FunctionComponent = () => {
  const [history] = useAtom(historyAtom);

  const [favorite, regular] = useMemo(
    () =>
      history
        .toSorted((a, b) => b.timestamp - a.timestamp)
        .reduce<[favorite: HistoryEntry[], regular: HistoryEntry[]]>(
          (array, entry) => {
            if (entry.favorite) {
              array[0].push(entry);
              return array;
            }

            array[1].push(entry);
            return array;
          },
          [[], []],
        ),
    [history],
  );

  return (
    <Bleed inline="6" asChild={true}>
      <Stack gap="4" flex="1" overflowY="auto" paddingX="6">
        {favorite.length > 0 && (
          <Stack gap="1">
            <Heading as="h2" size="sm">
              Favorite requests
            </Heading>

            <Bleed inline="2">
              <List.Root variant="plain">
                {favorite.map((entry) => (
                  <HistoryItem entry={entry} key={entry.timestamp} />
                ))}
              </List.Root>
            </Bleed>
          </Stack>
        )}

        {regular.length > 0 && (
          <Stack gap="1">
            <Heading as="h2" size="sm">
              Previous requests
            </Heading>

            <Bleed inline="2">
              <List.Root variant="plain">
                {regular.map((entry) => (
                  <HistoryItem entry={entry} key={entry.timestamp} />
                ))}
              </List.Root>
            </Bleed>
          </Stack>
        )}
      </Stack>
    </Bleed>
  );
};
