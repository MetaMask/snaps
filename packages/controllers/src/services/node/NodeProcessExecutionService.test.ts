import { ControllerMessenger } from '@metamask/controllers';
import { ErrorJSON, ErrorMessageEvent, SnapId } from '@metamask/snap-types';
import { NodeProcessExecutionService } from './NodeProcessExecutionService';

describe('NodeProcessExecutionService', () => {
  it('can boot', async () => {
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const service = new NodeProcessExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
    });
    expect(service).toBeDefined();
    await service.terminateAllSnaps();
  });

  it('can create a snap worker and start the snap', async () => {
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const service = new NodeProcessExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
    });
    const response = await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });
    expect(response).toStrictEqual('OK');
    await service.terminateAllSnaps();
  });

  it('can handle a crashed snap', async () => {
    expect.assertions(1);
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const service = new NodeProcessExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
    });
    const action = async () => {
      await service.executeSnap({
        snapId: 'TestSnap',
        sourceCode: `
          throw new Error("potato");
        `,
        endowments: [],
      });
    };

    await expect(action()).rejects.toThrow(
      /Error while running snap 'TestSnap'/u,
    );
    await service.terminateAllSnaps();
  });

  it('can handle errors in request handler', async () => {
    expect.assertions(1);
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const service = new NodeProcessExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
    });
    const snapId = 'TestSnap';
    await service.executeSnap({
      snapId,
      sourceCode: `
      module.exports.onRpcRequest = async () => { throw new Error("foobar"); };
      `,
      endowments: [],
    });

    const hook = await service.getRpcRequestHandler(snapId);

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      hook!('fooOrigin', {
        jsonrpc: '2.0',
        method: 'foo',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow('foobar');
    await service.terminateAllSnaps();
  });

  it('can handle errors out of band', async () => {
    expect.assertions(2);
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const service = new NodeProcessExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
    });
    const snapId = 'TestSnap';
    await service.executeSnap({
      snapId,
      sourceCode: `
      module.exports.onRpcRequest = async () => 
      { 
        new Promise((resolve, _reject) => {
          let num = 0;
          while (num < 100) {
            // eslint-disable-next-line no-plusplus
            num++;
          }
          throw new Error('random error inside');
          resolve(undefined);
        });
        return 'foo';
       };
      `,
      endowments: [],
    });

    const hook = await service.getRpcRequestHandler(snapId);

    const unhandledErrorPromise = new Promise((resolve) => {
      controllerMessenger.subscribe(
        'ExecutionService:unhandledError',
        (_snapId: SnapId, error: ErrorJSON) => {
          resolve(error);
        },
      );
    });

    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await hook!('fooOrigin', {
        jsonrpc: '2.0',
        method: '',
        params: {},
        id: 1,
      }),
    ).toBe('foo');

    expect(await unhandledErrorPromise).toStrictEqual({
      code: -32603,
      data: { snapName: 'TestSnap' },
      message: 'Execution Environment Error',
    });

    await service.terminateAllSnaps();
  });
});
