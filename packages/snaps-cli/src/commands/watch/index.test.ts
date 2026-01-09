import command from '.';
import { watchHandler } from './watch';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';

jest.mock('./watch');

const getMockArgv = (manifest?: string | undefined) => {
  return {
    context: { config: getMockConfig() },
    manifest,
  } as unknown as YargsArgs;
};

describe('watch command', () => {
  it('calls the `watchHandler` function', async () => {
    await command.handler(getMockArgv());
    expect(watchHandler).toHaveBeenCalled();
  });

  it('calls the `watchHandler` function with a custom manifest path', async () => {
    await command.handler(getMockArgv('/custom.json'));
    expect(watchHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        manifest: expect.objectContaining({
          path: expect.stringContaining('custom.json'),
        }),
      }),
      {
        port: undefined,
      },
    );
  });
});
