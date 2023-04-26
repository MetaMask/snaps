/**
 * The environment in which to run the benchmarks.
 *
 * If `all` is specified, the benchmarks will be run in all environments.
 */
export enum Environment {
  All = 'all',
  Iframe = 'iframe',
  WebWorker = 'web-worker',
  NodeThread = 'node-thread',
  NodeProcess = 'node-process',
}

export type BenchmarkResult = {
  name: string;
  duration: number;
  iterations: number;
  environment: Environment;
};

export abstract class BenchmarkRunner {
  abstract run(): Promise<void>;
}
