import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import yargs from 'yargs';

import command from '.';
import { buildHandler } from './build';
import type { YargsArgs } from '../../types/yargs';

jest.mock('./build');

const getMockArgv = (manifest?: string | undefined) => {
  return {
    context: { config: getMockConfig() },
    manifest,
    preinstalled: true,
  } as unknown as YargsArgs;
};

describe('build command', () => {
  it('calls the `buildHandler` function', async () => {
    const config = getMockConfig();

    // @ts-expect-error - Partial `YargsArgs` is fine for testing.
    await command.handler({
      analyze: false,
      preinstalled: false,
      context: { config },
    });

    expect(buildHandler).toHaveBeenCalledWith(config, {
      analyze: false,
      preinstalled: false,
    });
  });

  it('calls the `buildHandler` function with a custom manifest path', async () => {
    await command.handler(getMockArgv('/custom.json'));
    expect(buildHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        manifest: expect.objectContaining({
          path: expect.stringContaining('custom.json'),
        }),
      }),
      { analyze: undefined, preinstalled: true },
    );
  });

  it('throws if `--manifest` is used without `--preinstalled`', async () => {
    expect.assertions(2);

    const yarg = yargs();
    command.builder(yarg);

    yarg.parseSync(
      ['mm-snap', 'build', '--manifest', 'path/to/manifest.json'],
      {},
      (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toBe(
          'The `--manifest` option requires the `--preinstalled` flag to be set.',
        );
      },
    );
  });
});
