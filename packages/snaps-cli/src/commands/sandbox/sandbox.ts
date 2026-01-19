import { startSandbox } from './server';
import type { ProcessedConfig } from '../../config';
import type { Steps } from '../../utils';
import { success, executeSteps } from '../../utils';
import { steps as buildSteps } from '../build';
import type { BuildContext } from '../build/build';

type SandboxOptions = {
  build?: boolean;
};

type SandboxContext = BuildContext;

const steps: Steps<SandboxContext> = [
  ...buildSteps,
  {
    name: 'Running sandbox.',
    task: async ({ config, spinner }) => {
      const { port } = await startSandbox(config);
      success(`Sandbox running at http://localhost:${port}.`, spinner);

      spinner.stop();
    },
  },
];

/**
 * Start the sandbox.
 *
 * @param config - The config object.
 * @param options - The options object.
 * @param options.build - Whether to build the Snap before starting the sandbox.
 */
export async function sandboxHandler(
  config: ProcessedConfig,
  { build = true }: SandboxOptions,
) {
  await executeSteps(steps, {
    build,
    config,
    options: {},
  });
}
