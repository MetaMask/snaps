import { WebWorkerParentPostMessageStream } from '@metamask/post-message-stream';

type PoolWorker = {
  worker: Worker;
  stream: WebWorkerParentPostMessageStream;
};

/**
 * WebWorker pool, used to execute snaps in WebWorkers.
 */
export class Pool {
  #url: string;

  #pool: Map<string, PoolWorker> = new Map();

  constructor(url: string) {
    this.#url = url;

    this.#createWorker('worker-1');
  }

  #createWorker(id: string) {
    const worker = new Worker(new URL(this.#url));
    this.#pool.set(id, {
      worker,
      stream: new WebWorkerParentPostMessageStream({ worker }),
    });
  }
}
