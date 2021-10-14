import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers';
import {
  ErrorMessageEvent,
  ServiceMessenger,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { WebWorkerExecutionEnvironmentService } from './WebWorkerExecutionEnvironmentService';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/snap-workers/dist/PluginWorker.js'),
  'utf8',
);

describe('Worker Controller', () => {
  it('can boot', async () => {
    const messenger: ServiceMessenger = new ControllerMessenger().getRestricted<
      'ServiceMessenger',
      never,
      ErrorMessageEvent['type']
    >({
      name: 'ServiceMessenger',
    });
    const webWorkerExecutionEnvironmentService =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: () => {
          // do nothing
        },
        workerUrl: new URL('https://foo.bar.baz'),
      });
    expect(webWorkerExecutionEnvironmentService).toBeDefined();
  });

  it('can create a plugin worker and start the plugin', async () => {
    const messenger: ServiceMessenger = new ControllerMessenger().getRestricted<
      'ServiceMessenger',
      never,
      ErrorMessageEvent['type']
    >({
      name: 'ServiceMessenger',
    });
    const webWorkerExecutionEnvironmentService =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: () => {
          // do nothing
        },
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginName = 'foo.bar.baz';
    const response = await webWorkerExecutionEnvironmentService.executePlugin({
      pluginName,
      sourceCode: `
        console.log('foo');
      `,
    });

    expect(response).toStrictEqual('OK');
  });

  it('can create a plugin worker and handle no ping reply', async () => {
    const messenger = new ControllerMessenger<
      never,
      UnresponsiveMessageEvent
    >().getRestricted<
      'ServiceMessenger',
      never,
      UnresponsiveMessageEvent['type']
    >({
      name: 'ServiceMessenger',
      allowedEvents: ['ServiceMessenger:unresponsive'],
    });
    const webWorkerExecutionEnvironmentService =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: () => {
          // do nothing
        },
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });

    const pluginName = 'foo.bar.baz';
    await webWorkerExecutionEnvironmentService.executePlugin({
      pluginName,
      sourceCode: `
        console.log('foo');
      `,
    });

    // prevent command from returning
    // eslint-disable-next-line jest/prefer-spy-on
    (webWorkerExecutionEnvironmentService as any)._command = jest.fn();

    // check for an error
    const promise = new Promise((resolve) => {
      messenger.subscribe('ServiceMessenger:unresponsive', resolve);
    });

    const result = await promise;
    expect(result).toStrictEqual(pluginName);
  }, 60000);
});
