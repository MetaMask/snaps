// eslint-disable-next-line import-x/no-unassigned-import
import 'ses';
import { HandlerType, SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import { MOCK_ORIGIN, MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { Json, JsonRpcSuccess } from '@metamask/utils';
import { EventEmitter } from 'stream';

import { ChildProcessSnapExecutor } from './ChildProcessSnapExecutor';

describe('ChildProcessSnapExecutor', () => {
  it('receives and processes commands', async () => {
    const parentEmitter = new EventEmitter();
    const childEmitter = new EventEmitter();

    const onSpy = jest
      .spyOn(globalThis.process, 'on')
      .mockImplementation(
        (event, listener) => parentEmitter.on(event, listener) as any,
      );
    const sendSpy = jest
      .spyOn(globalThis.process, 'send')
      .mockImplementation((message) => childEmitter.emit('message', message));

    // Initialize
    ChildProcessSnapExecutor.initialize();
    expect(onSpy).toHaveBeenCalled();

    const CODE = `
      exports.onRpcRequest = (() => {
        return 'foobar';
      });
    `;

    // Utility functions
    const emit = (data: Json) => parentEmitter.emit('message', { data });
    const emitChunk = (name: string, data: Json) => emit({ name, data });

    const waitForResponse = async (response: JsonRpcSuccess<string>) =>
      new Promise((resolve) => {
        childEmitter.on('message', ({ data }) => {
          if (
            data.data.id === response.id &&
            data.data.result === response.result
          ) {
            resolve(response);
          }
        });
      });

    // Handshake
    expect(sendSpy).toHaveBeenNthCalledWith(1, { data: 'SYN' });
    emit('ACK');
    expect(sendSpy).toHaveBeenNthCalledWith(2, { data: 'ACK' });

    // Execute Snap
    emitChunk(SNAP_STREAM_NAMES.COMMAND, {
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: { snapId: MOCK_SNAP_ID, sourceCode: CODE, endowments: [] },
    });

    expect(
      await waitForResponse({ result: 'OK', id: 1, jsonrpc: '2.0' }),
    ).not.toBeNull();

    // Process Snap RPC request
    emitChunk(SNAP_STREAM_NAMES.COMMAND, {
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: {
        snapId: MOCK_SNAP_ID,
        handler: HandlerType.OnRpcRequest,
        origin: MOCK_ORIGIN,
        request: { jsonrpc: '2.0', method: '' },
      },
    });

    expect(
      await waitForResponse({ result: 'foobar', id: 2, jsonrpc: '2.0' }),
    ).not.toBeNull();
  });
});
