import command from '.';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';
import { manifestHandler } from './manifest';

jest.mock('./manifest');

const getMockArgv = () => {
  return {
    context: { config: getMockConfig('webpack') },
  } as unknown as YargsArgs;
};

describe('eval command', () => {
  it('calls the `evaluateHandler` function', async () => {
    await command.handler(getMockArgv());
    expect(manifestHandler).toHaveBeenCalled();
  });
});
