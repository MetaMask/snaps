import index from '.';
import { YargsArgs } from '../../types/yargs';
import { manifestHandler } from './manifestHandler';

jest.mock('./manifestHandler');

const getMockArgv = ({ writeManifest = true } = {}) => {
  return { writeManifest } as unknown as YargsArgs;
};

const manifestHandlerMock = manifestHandler as jest.MockedFunction<
  typeof manifestHandler
>;

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
