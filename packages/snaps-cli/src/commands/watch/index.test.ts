import command from '.';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';
import { watchHandler } from './watch';

jest.mock('./watch');

const getMockArgv = () => {
  return {
    context: { config: getMockConfig('webpack') },
  } as unknown as YargsArgs;
};

describe('watch command', () => {
  it('calls the `watchHandler` function', async () => {
    await command.handler(getMockArgv());
    expect(watchHandler).toHaveBeenCalled();
  });
});
