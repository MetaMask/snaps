import index from '.';
import type { YargsArgs } from '../../types/yargs';
import { evaluate } from './eval';

jest.mock('./eval');

const getMockArgv = ({ bundle = 'dist/snap.js' } = {}) => {
  return { bundle } as unknown as YargsArgs;
};

const evalHandlerMock = evaluate as jest.MockedFunction<typeof evaluate>;

describe('handler', () => {
  it('calls evalHandler', async () => {
    await index.handler(getMockArgv());

    expect(evalHandlerMock).toHaveBeenCalled();
  });
});
