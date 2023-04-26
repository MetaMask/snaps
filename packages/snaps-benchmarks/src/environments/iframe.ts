import { assert } from '@metamask/utils';
import { Browser, remote } from 'webdriverio';

import { BenchmarkRunner } from './environment';

const DEFAULT_URL = 'https://execution.metamask.io/0.15.1/index.html';

export type IframeRunnerOptions = {
  url?: string;
};

export class IframeRunner extends BenchmarkRunner {
  #url: string;

  #browser?: Browser;

  constructor({ url = DEFAULT_URL }: IframeRunnerOptions) {
    super();
    this.#url = url;
  }

  async initialize() {
    this.#browser = await remote({
      automationProtocol: 'devtools',
      capabilities: {
        browserName: 'chrome',
        /* eslint-disable @typescript-eslint/naming-convention */
        'goog:chromeOptions': {
          args: [],
        },
        'wdio:devtoolsOptions': {
          headless: false,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    });
  }

  async run() {
    assert(this.#browser, 'Browser not initialized.');

    console.log('Running in iframe');
  }
}
