import index from '.';
import { getMockConfig } from '../../test-utils';
import type { YargsArgs } from '../../types/yargs';
import { evaluate } from './eval';

jest.mock('./eval');

const getMockArgv = ({ bundle = 'dist/snap.js' } = {}) => {
  return {
    context: { config: getMockConfig('webpack') },
    bundle,
  } as unknown as YargsArgs;
};

describe('handler', () => {
  it('calls eval', async () => {
    await index.handler(getMockArgv());

    const mock = evaluate as jest.MockedFunction<typeof evaluate>;
    expect(mock).toHaveBeenCalled();
  });
});
