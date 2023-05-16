import { assert, Json, JsonRpcRequest } from '@metamask/utils';

import { DEFAULT_JSON_RPC_REQUEST, DEFAULT_SNAP_BUNDLE } from '../snap';

/**
 * The environment in which to run the benchmarks.
 *
 * If `all` is specified, the benchmarks will be run in all environments.
 */
export enum Environment {
  All = 'all',
  Iframe = 'iframe',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Worker = 'worker',
  // NodeThread = 'node-thread',
  // NodeProcess = 'node-process',
}

export type BenchmarkResult<Result extends Json> = {
  name: string;
  duration: number;
  result: Result;
};

export type BenchmarkStats = {
  total: number;
  average: number;
  min: number;
  max: number;
};

export type BenchmarkRunnerOptions = {
  snaps: number;
  iterations: number;

  requests: number;
};

export abstract class BenchmarkRunner {
  #snaps: number;

  #iterations: number;

  #requests: number;

  constructor({ snaps, iterations, requests }: BenchmarkRunnerOptions) {
    this.#snaps = snaps;
    this.#iterations = iterations;
    this.#requests = requests;
  }

  abstract initialize(): Promise<void>;

  abstract executeSnap(snapId: string, sourceCode: string): Promise<void>;

  abstract handleRpcRequest(
    snapId: string,
    request: JsonRpcRequest,
  ): Promise<unknown>;

  abstract terminateAllSnaps(): Promise<void>;

  abstract stop(): Promise<void>;

  async #measure<Result extends Json>(
    name: string,
    fn: () => Promise<Result>,
  ): Promise<BenchmarkResult<Result>> {
    const now = performance.now();
    const result = await fn();
    const duration = performance.now() - now;

    return {
      name,
      duration,
      result,
    };
  }

  async run(
    sourceCode = DEFAULT_SNAP_BUNDLE,
    request: JsonRpcRequest = DEFAULT_JSON_RPC_REQUEST,
  ): Promise<BenchmarkStats> {
    const results = [];

    for (let i = 0; i < this.#iterations; i++) {
      const promises = new Array(this.#snaps)
        .fill(undefined)
        .map(async (_, index) => {
          const snapId = `benchmark-${index}`;
          await this.executeSnap(snapId, sourceCode);

          return await this.#measure(`snap-${index}`, async () => {
            const requestPromises = new Array(this.#requests)
              .fill(undefined)
              .map(async () => {
                const result = await this.handleRpcRequest(snapId, request);
                assert(result === 'OK', `Unexpected result: ${String(result)}`);

                return result;
              });

            return await Promise.all(requestPromises);
          });
        });

      const result = await Promise.all(promises);
      results.push(...result);

      await this.terminateAllSnaps();
    }

    const durations = results.map(({ duration }) => duration);
    const total = durations.reduce((a, b) => a + b, 0);
    const average = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      total,
      average,
      min,
      max,
    };
  }
}
