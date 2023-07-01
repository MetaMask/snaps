import command from '.';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';
import { evaluateHandler } from './eval';

jest.mock('./eval');

const getMockArgv = ({ bundle = 'dist/snap.js' } = {}) => {
  return {
    context: { config: getMockConfig('webpack') },
    bundle,
  } as unknown as YargsArgs;
};

describe('eval command', () => {
  it('calls the `evaluateHandler` function', async () => {
    await command.handler(getMockArgv());
    expect(evaluateHandler).toHaveBeenCalled();
  });
});
