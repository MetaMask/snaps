import { BrowserRunner, BrowserRunnerOptions } from './browser';

const DEFAULT_URL = 'https://execution.metamask.io/0.15.1/index.html';

export type IframeRunnerOptions = Omit<BrowserRunnerOptions, 'bundleName'> & {
  url?: string;
};

export class IframeRunner extends BrowserRunner {
  #url: string;

  constructor({ url = DEFAULT_URL, ...options }: IframeRunnerOptions) {
    super({ bundleName: 'iframe', ...options });
    this.#url = url;
  }
}
