import command from '.';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';
import { serveHandler } from './serve';

jest.mock('./serve');

const getMockArgv = () => {
  return {
    context: { config: getMockConfig('webpack') },
  } as unknown as YargsArgs;
};

describe('serve command', () => {
  it('calls the `serveHandler` function', async () => {
    await command.handler(getMockArgv());
    expect(serveHandler).toHaveBeenCalled();
  });
});
