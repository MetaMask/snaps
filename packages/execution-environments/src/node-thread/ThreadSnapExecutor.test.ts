// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import { EventEmitter } from 'stream';
import { parentPort } from 'worker_threads';
import { Json, JsonRpcSuccess } from '@metamask/utils';
import { SNAP_STREAM_NAMES, HandlerType } from '../common/enums';
import { ThreadSnapExecutor } from './ThreadSnapExecutor';

const FAKE_ORIGIN = 'origin:foo';
const FAKE_SNAP_NAME = 'local:foo';
const ON_RPC_REQUEST = HandlerType.onRpcRequest;

jest.mock('worker_threads', () => ({
  parentPort: {
    on: jest.fn(),
    postMessage: jest.fn(),
    removeListener: jest.fn(),
  },
}));

describe('ThreadSnapExecutor', () => {
  it('receives and processes commands', async () => {
    const parentEmitter = new EventEmitter();
    const childEmitter = new EventEmitter();

    const onSpy = jest
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(parentPort!, 'on')
      .mockImplementation(
        (event, listener) => parentEmitter.on(event, listener) as any,
      );
    const sendSpy = jest
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(parentPort!, 'postMessage')
      .mockImplementation((message) => childEmitter.emit('message', message));

    // Initialize
    ThreadSnapExecutor.initialize();
    expect(onSpy).toHaveBeenCalled();

    const CODE = `
        exports.onRpcRequest = (() => {
          return 'foobar';
        });
      `;

    // Utility functions
    const emit = (data: Json) => parentEmitter.emit('message', { data });
    const emitChunk = (name: string, data: Json) => emit({ name, data });
    const waitForResponse = (response: JsonRpcSuccess<string>) =>
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
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(
      await waitForResponse({ result: 'OK', id: 1, jsonrpc: '2.0' }),
    ).not.toBeNull();

    // Process Snap RPC request
    emitChunk(SNAP_STREAM_NAMES.COMMAND, {
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '' },
      ],
    });

    expect(
      await waitForResponse({ result: 'foobar', id: 2, jsonrpc: '2.0' }),
    ).not.toBeNull();
  });
});
