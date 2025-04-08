import { Button, HStack } from '@chakra-ui/react';
import { isJsonRpcRequest } from '@metamask/utils';
import { useAtomValue } from 'jotai';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { Fox } from './Fox';
import { InstallButton } from './InstallButton';
import { InstallFlaskButton } from './InstallFlaskButton';
import { useSnaps, useRequest } from '../hooks';
import { useSnapId } from '../hooks/useSnapId';
import { providerAtom, requestAtom } from '../state';
import { getJsonRpcRequestWithDefaults, parseJson } from '../utils';

/**
 * A button that sends a JSON-RPC request to the Snap. If the Snap is not
 * installed, it will prompt the user to install it. If the provider is not
 * available, it will prompt the user to install MetaMask Flask.
 *
 * @returns The request button component.
 */
export const RequestButton: FunctionComponent = () => {
  const provider = useAtomValue(providerAtom);
  const request = useAtomValue(requestAtom);
  const snapId = useSnapId();

  const [json, setJson] = useState<unknown>(parseJson(request));
  const [valid, setValid] = useState(false);

  const { loading, snaps } = useSnaps();
  const { loading: requesting, request: sendRequest } = useRequest();

  useEffect(() => {
    if (request) {
      const parsedRequest = getJsonRpcRequestWithDefaults(request);

      setJson(parsedRequest);
      setValid(isJsonRpcRequest(parsedRequest));
    }
  }, [request]);

  const handleClick = () => {
    if (isJsonRpcRequest(json)) {
      sendRequest(json);
    }
  };

  if (!provider) {
    return <InstallFlaskButton />;
  }

  if (loading) {
    return (
      <Button colorScheme="info" loading={loading}>
        <HStack>
          <Fox boxSize="1.25rem" />
          Install Snap
        </HStack>
      </Button>
    );
  }

  if (!snaps.includes(snapId)) {
    return <InstallButton />;
  }

  return (
    <Button
      onClick={handleClick}
      loading={requesting}
      disabled={!valid}
      colorScheme="info"
    >
      <HStack>
        <Fox boxSize="1.25rem" /> Execute request
      </HStack>
    </Button>
  );
};
