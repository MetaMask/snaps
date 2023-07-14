import { Box, Button, Spinner } from '@chakra-ui/react';
import { hasProperty } from '@metamask/utils';
import { useEffect, useState } from 'react';

import { Icon } from '../../../components';
import { useHandler, useSelector } from '../../../hooks';

enum PlayButtonState {
  Ready = 'ready',
  Disabled = 'disabled',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

export const PlayButton = () => {
  const handler = useHandler();
  const response = useSelector((state) => state[handler].response);

  const isError = response && hasProperty(response, 'error');
  const isSuccess = response && !hasProperty(response, 'error');
  const isLoading = useSelector((state) => state[handler].pending);

  const [state, setState] = useState(PlayButtonState.Ready);

  useEffect(() => {
    if (isLoading) {
      setState(PlayButtonState.Loading);
    } else if (isError) {
      setState(PlayButtonState.Error);
    } else if (isSuccess) {
      setState(PlayButtonState.Success);
    }
  }, [isLoading, isError, isSuccess]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (state === PlayButtonState.Success || state === PlayButtonState.Error) {
      const timeout = setTimeout(() => {
        setState(PlayButtonState.Ready);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [state]);

  const icons = {
    [PlayButtonState.Ready]: 'play',
    [PlayButtonState.Disabled]: 'playMuted',
    [PlayButtonState.Success]: 'playSuccess',
    [PlayButtonState.Error]: 'playError',
  } as any;

  return (
    <Button
      variant="unstyled"
      type="submit"
      minWidth="0"
      form="request-form"
      data-testid="send-request-button"
      disabled={state !== PlayButtonState.Ready}
    >
      {state !== PlayButtonState.Loading && (
        <Icon
          icon={icons[state]}
          width="24px"
          data-testid="send-request-button-done"
        />
      )}
      {state === PlayButtonState.Loading && (
        <Box bg="info.default" borderRadius="50%" width="24px">
          <Spinner size="xs" color="white" />
        </Box>
      )}
    </Button>
  );
};
