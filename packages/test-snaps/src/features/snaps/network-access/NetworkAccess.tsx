import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';

import {
  NETWORK_ACCESS_PORT,
  NETWORK_ACCESS_SNAP_ID,
  NETWORK_ACCESS_VERSION,
} from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';

export const NetworkAccess: FunctionComponent = () => {
  const [fetchUrl, setFetchUrl] = useState(
    `${window.location.href}test-data.json`,
  );
  const [webSocketUrl, setWebSocketUrl] = useState('ws://localhost:8545');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleFetchUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFetchUrl(event.target.value);
  };

  const handleWebSocketUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWebSocketUrl(event.target.value);
  };

  const snapId = getSnapId(NETWORK_ACCESS_SNAP_ID, NETWORK_ACCESS_PORT);

  const handleFetch = () => {
    invokeSnap({
      snapId,
      method: 'fetch',
      params: { url: fetchUrl },
    }).catch(logError);
  };

  const handleStartWebSocket = () => {
    invokeSnap({
      snapId,
      method: 'startWebSocket',
      params: { url: webSocketUrl },
    }).catch(logError);
  };

  const handleStopWebSocket = () => {
    invokeSnap({
      snapId,
      method: 'stopWebSocket',
      params: { url: webSocketUrl },
    }).catch(logError);
  };

  const handleGetState = () => {
    invokeSnap({
      snapId,
      method: 'getState',
    }).catch(logError);
  };

  return (
    <Snap
      name="Network Access Snap"
      snapId={NETWORK_ACCESS_SNAP_ID}
      port={NETWORK_ACCESS_PORT}
      version={NETWORK_ACCESS_VERSION}
      testId="network-access"
    >
      <Form.Control
        type="text"
        placeholder="URL"
        value={fetchUrl}
        onChange={handleFetchUrlChange}
        id="fetchUrl"
        className="mb-3"
      />
      <Button
        variant="primary"
        id="sendNetworkAccessTest"
        className="mb-3"
        disabled={isLoading}
        onClick={handleFetch}
      >
        Fetch
      </Button>

      <Form.Control
        type="text"
        placeholder="URL"
        value={webSocketUrl}
        onChange={handleWebSocketUrlChange}
        id="webSocketUrl"
        className="mb-3"
      />

      <ButtonGroup className="d-block mb-3">
        <Button
          variant="primary"
          id="startWebSocket"
          disabled={isLoading}
          onClick={handleStartWebSocket}
        >
          Start WebSocket
        </Button>
        <Button
          variant="primary"
          id="stopWebSocket"
          disabled={isLoading}
          onClick={handleStopWebSocket}
        >
          Stop WebSocket
        </Button>

        <Button
          variant="primary"
          id="getWebSocketState"
          disabled={isLoading}
          onClick={handleGetState}
        >
          Get State
        </Button>
      </ButtonGroup>

      <Result>
        <span id="networkAccessResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
