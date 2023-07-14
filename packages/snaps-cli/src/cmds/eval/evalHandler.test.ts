import { evalBundle } from '@metamask/snaps-utils';

import type { YargsArgs } from '../../types/yargs';
import { evalHandler } from './evalHandler';

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  evalBundle: jest.fn(),
}));

const getMockArgv = ({ bundle = 'bundle.js' } = {}) => {
  return { bundle } as unknown as YargsArgs;
};

const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;

describe('evalHandler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('evaluates a bundle', async () => {
    await evalHandler(getMockArgv());

    expect(console.log).toHaveBeenCalledWith(
      "Eval Success: evaluated 'bundle.js' in SES!",
    );
  });

  it('logs and throws errors', async () => {
    evalBundleMock.mockRejectedValueOnce(new Error('foo'));

    await expect(evalHandler(getMockArgv())).rejects.toThrow(
      'Snap evaluation error: foo',
    );
  });
});
