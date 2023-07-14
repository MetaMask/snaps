import {
  Box,
  Flex,
  ListItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useTabsContext,
} from '@chakra-ui/react';
import type { JsonRpcRequest } from '@metamask/utils';
import { formatDistance } from 'date-fns';
import type { FunctionComponent } from 'react';

import { Icon } from '../../../components';
import { useDispatch, useHandler } from '../../../hooks';
import type { HistoryEntry } from '../slice';

export type HistoryItemProps<Request extends { request?: JsonRpcRequest }> = {
  item: HistoryEntry<Request>;
};

export const HistoryItem: FunctionComponent<
  HistoryItemProps<{ request?: JsonRpcRequest }>
> = ({ item }) => {
  const dispatch = useDispatch();
  const tab = useTabsContext();
  const handler = useHandler();

  const handleClick = () => {
    dispatch({
      type: `${handler}/setRequestFromHistory`,
      payload: item.request,
    });
    tab.setSelectedIndex(0);
  };

  return (
    <ListItem onClick={handleClick}>
      <Popover trigger="hover" openDelay={10}>
        <PopoverTrigger>
          <Flex
            margin="2"
            padding="2"
            borderRadius="md"
            justifyContent="space-between"
            alignItems="center"
            _hover={{
              cursor: 'pointer',
              background: 'background.hover',
            }}
            gap="2"
          >
            <Box overflow="hidden">
              <Text
                fontSize="sm"
                fontWeight="600"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {item.request?.request?.method}
              </Text>
              <Text color="text.muted" fontSize="sm">
                {formatDistance(item.date, new Date(), { addSuffix: true })}
              </Text>
            </Box>
            <Box>
              <Icon icon="arrowTopRight" width="10px" />
            </Box>
          </Flex>
        </PopoverTrigger>
        <PopoverContent
          padding="4"
          fontFamily="code"
          fontSize="xs"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <Text
            display="block"
            as="pre"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="pre"
          >
            {JSON.stringify(item.request?.request, null, 2)}
          </Text>
        </PopoverContent>
      </Popover>
    </ListItem>
  );
};
