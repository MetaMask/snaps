import command from '.';
import { sandboxHandler } from './sandbox';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';

jest.mock('./sandbox');

const getMockArgv = () => {
  return {
    context: { config: getMockConfig('webpack') },
  } as unknown as YargsArgs;
};

describe('sandbox command', () => {
  it('calls the `sandboxHandler` function', async () => {
    await command.handler(getMockArgv());
    expect(sandboxHandler).toHaveBeenCalled();
  });
});
