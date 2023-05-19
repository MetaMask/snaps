import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Icon } from '../../components';
import { useDispatch, useSelector } from '../../hooks';
import { getSnapUrl, openConfigurationModal } from '../configuration';
import { SnapStatus, getStatus } from '../simulation';

export const StatusIndicator = () => {
  const snapUrl = useSelector(getSnapUrl);
  const status = useSelector(getStatus);
  const dispatch = useDispatch();

  const [prettyUrl, setPrettyUrl] = useState(snapUrl);

  useEffect(() => {
    if (snapUrl) {
      try {
        const url = new URL(snapUrl);
        setPrettyUrl(url.host);
      } catch {
        // Ignore.
      }
    }
  }, [snapUrl]);

  const color =
    // eslint-disable-next-line no-nested-ternary
    status === SnapStatus.Ok
      ? 'text.success'
      : status === SnapStatus.Error
      ? 'text.error'
      : 'info.default';

  const handleClick = () => {
    dispatch(openConfigurationModal());
  };

  return (
    <Flex
      alignItems="center"
      gap="2"
      onClick={handleClick}
      cursor="pointer"
      _hover={{
        p: {
          color,
        },
      }}
    >
      {status === SnapStatus.Ok && <Icon icon="dot" width="8px" />}
      {status === SnapStatus.Loading && <Spinner color={color} size="xs" />}
      {status === SnapStatus.Error && (
        <Icon icon="errorTriangle" width="16px" />
      )}
      <Text
        fontWeight="500"
        fontSize="sm"
        color="text.muted"
        transition="color ease 0.2s"
      >
        {prettyUrl}
      </Text>
    </Flex>
  );
};
