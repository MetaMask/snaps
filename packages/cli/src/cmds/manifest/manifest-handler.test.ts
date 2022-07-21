import { checkManifest, CheckManifestResult } from '@metamask/snap-utils';
import { YargsArgs } from '../../types/yargs';
import { manifestHandler } from './manifest-handler';

jest.mock('@metamask/snap-utils');

const getMockArgv = ({ writeManifest = true } = {}) => {
  return { writeManifest } as unknown as YargsArgs;
};

const checkManifestMock = checkManifest as jest.MockedFunction<
  typeof checkManifest
>;

describe('manifestHandler', () => {
  it('logs manifest errors if writeManifest is disabled', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    checkManifestMock.mockResolvedValueOnce({
      errors: ['foo', 'bar'],
      warnings: [],
    } as unknown as CheckManifestResult);

    await manifestHandler(getMockArgv({ writeManifest: false }));

    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalledWith('Manifest Error: foo');
    expect(console.error).toHaveBeenCalledWith('Manifest Error: bar');
  });

  it('logs manifest warnings', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    checkManifestMock.mockResolvedValueOnce({
      warnings: ['foo', 'bar'],
    } as CheckManifestResult);

    await manifestHandler(getMockArgv());

    expect(console.warn).toHaveBeenCalledTimes(3);
    expect(console.warn).toHaveBeenCalledWith('Manifest Warning: foo');
    expect(console.warn).toHaveBeenCalledWith('Manifest Warning: bar');
  });

  it('suppresses manifest warnings', async () => {
    global.snaps.suppressWarnings = true;

    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    checkManifestMock.mockResolvedValueOnce({
      errors: [],
      warnings: ['foo', 'bar'],
    } as unknown as CheckManifestResult);

    await manifestHandler(getMockArgv({ writeManifest: false }));

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('forwards manifest errors', async () => {
    checkManifestMock.mockRejectedValueOnce('foo');

    await expect(manifestHandler(getMockArgv())).rejects.toThrow(
      'Manifest Error: foo',
    );
  });
});
