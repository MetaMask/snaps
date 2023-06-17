import index from '.';
import type { YargsArgs } from '../../types/yargs';
import { manifest } from './manifest';

jest.mock('./manifest');

const getMockArgv = ({ writeManifest = true } = {}) => {
  return { writeManifest } as unknown as YargsArgs;
};

const manifestHandlerMock = manifest as jest.MockedFunction<typeof manifest>;

describe('handler', () => {
  it('calls manifestHandler', async () => {
    await index.handler(getMockArgv());

    expect(manifestHandlerMock).toHaveBeenCalled();
  });

  it('forwards and logs errors', async () => {
    manifestHandlerMock.mockRejectedValueOnce(new Error('foo'));
    jest.spyOn(console, 'error').mockImplementationOnce(() => undefined);

    await expect(index.handler(getMockArgv())).rejects.toThrow('foo');
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
