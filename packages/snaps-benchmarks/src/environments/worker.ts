import express, { Express } from 'express';
import { join } from 'path';

import { BrowserRunner, BrowserRunnerOptions } from './browser';

const DEFAULT_URL = 'https://execution.metamask.io/0.15.1/index.html';

export type WorkerRunnerOptions = Omit<BrowserRunnerOptions, 'bundleName'> & {
  url?: string;
};

export class WorkerRunner extends BrowserRunner {
  #url: string;

  constructor({ url = DEFAULT_URL, ...options }: WorkerRunnerOptions) {
    super({ bundleName: 'worker-pool', ...options });
    this.#url = url;
  }

  protected setupRoutes(app: Express) {
    super.setupRoutes(app);

    app.use(
      '/executor',
      express.static(join(this.executionEnvironmentPath, '../worker-executor')),
    );
  }
}
