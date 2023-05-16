import {
  BenchmarkRunner,
  BenchmarkRunnerOptions,
  Environment,
} from './environment';
import { IframeRunner } from './iframe';
import { WorkerRunner } from './worker';

export * from './environment';
export * from './iframe';

export const environments: Record<
  Environment,
  new (args: BenchmarkRunnerOptions) => BenchmarkRunner
> = {
  [Environment.All]: IframeRunner,
  [Environment.Iframe]: IframeRunner,
  [Environment.Worker]: WorkerRunner,
  // [Environment.NodeProcess]: IframeRunner,
  // [Environment.NodeThread]: IframeRunner,
};
