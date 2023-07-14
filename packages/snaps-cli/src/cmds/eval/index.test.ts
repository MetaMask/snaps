import index from '.';
import type { YargsArgs } from '../../types/yargs';
import { evalHandler } from './evalHandler';

jest.mock('./evalHandler');

const getMockArgv = ({ bundle = 'dist/snap.js' } = {}) => {
  return { bundle } as unknown as YargsArgs;
};

const evalHandlerMock = evalHandler as jest.MockedFunction<typeof evalHandler>;

describe('handler', () => {
  it('calls evalHandler', async () => {
    await index.handler(getMockArgv());

    expect(evalHandlerMock).toHaveBeenCalled();
  });
});
