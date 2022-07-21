import { YargsArgs } from '../../types/yargs';
import { manifestHandler } from './manifestHandler';
import index from '.';

jest.mock('./manifestHandler');

const getMockArgv = ({ writeManifest = true } = {}) => {
  return { writeManifest } as unknown as YargsArgs;
};

const manifestHandlerMock = manifestHandler as jest.MockedFunction<
  typeof manifestHandler
>;

describe('handler', () => {
  it('calls manifestHandler', () => {
    index.handler(getMockArgv());

    expect(manifestHandlerMock).toHaveBeenCalled();
  });

  it('forwards and logs errors', async () => {
    manifestHandlerMock.mockRejectedValueOnce(new Error('foo'));
    jest.spyOn(console, 'error').mockImplementationOnce(() => undefined);

    await expect(index.handler(getMockArgv())).rejects.toThrow('foo');
    await expect(console.error).toHaveBeenCalledTimes(1);
  });
});
