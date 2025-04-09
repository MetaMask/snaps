import {
  Badge,
  DataList,
  HoverCard,
  HStack,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

import { useSnaps } from '../hooks';
import { useSnapId } from '../hooks/useSnapId';

export const Status: FunctionComponent = () => {
  const snapId = useSnapId();
  const { loading, snaps } = useSnaps();

  const isConnected = !loading && snaps.includes(snapId);

  const isTruncated = snapId.length > 20;
  const truncated = isTruncated
    ? `${snapId.slice(0, 10)}...${snapId.slice(-10)}`
    : snapId;

  return (
    <HoverCard.Root size="sm">
      <HoverCard.Trigger asChild>
        <Badge size="lg">
          {isConnected ? <FiCheckCircle /> : <FiAlertCircle />}
          {truncated}
        </Badge>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content>
            <HoverCard.Arrow />
            <Stack>
              <DataList.Root>
                <DataList.Item>
                  <DataList.ItemLabel>Snap ID</DataList.ItemLabel>
                  <DataList.ItemValue>{snapId}</DataList.ItemValue>
                </DataList.Item>
                <DataList.Item>
                  <DataList.ItemLabel>Connected</DataList.ItemLabel>
                  <DataList.ItemValue>
                    <HStack gap="1">
                      {isConnected ? (
                        <>
                          <FiCheckCircle aria-label="Connected" />{' '}
                          <Text aria-hidden="true">Yes</Text>
                        </>
                      ) : (
                        <>
                          <FiXCircle aria-label="Disconnected" />{' '}
                          <Text aria-hidden="true">No</Text>
                        </>
                      )}
                    </HStack>
                  </DataList.ItemValue>
                </DataList.Item>
              </DataList.Root>
            </Stack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
};
