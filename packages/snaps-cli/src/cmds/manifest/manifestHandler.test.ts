import {
  checkManifest,
  CheckManifestResult,
  logError,
  logWarning,
} from '@metamask/snaps-utils';

import { YargsArgs } from '../../types/yargs';
import { manifestHandler } from './manifestHandler';

jest.mock('@metamask/snaps-utils');

const getMockArgv = ({ writeManifest = true } = {}) => {
  return { writeManifest } as unknown as YargsArgs;
};

const checkManifestMock = checkManifest as jest.MockedFunction<
  typeof checkManifest
>;

describe('manifestHandler', () => {
  it('logs manifest errors if writeManifest is disabled', async () => {
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`exit ${code ?? '1'}`);
    });

    checkManifestMock.mockResolvedValueOnce({
      errors: ['foo', 'bar'],
      warnings: [],
    } as unknown as CheckManifestResult);

    await expect(
      manifestHandler(getMockArgv({ writeManifest: false })),
    ).rejects.toThrow('exit 1');

    expect(logError).toHaveBeenCalledTimes(3);
    expect(logError).toHaveBeenCalledWith('Manifest Error: foo');
    expect(logError).toHaveBeenCalledWith('Manifest Error: bar');
  });

  it('logs manifest warnings', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    checkManifestMock.mockResolvedValueOnce({
      warnings: ['foo', 'bar'],
    } as CheckManifestResult);

    await manifestHandler(getMockArgv());

    expect(logWarning).toHaveBeenCalledTimes(3);
    expect(logWarning).toHaveBeenCalledWith('Manifest Warning: foo');
    expect(logWarning).toHaveBeenCalledWith('Manifest Warning: bar');
  });

  it('suppresses manifest warnings', async () => {
    global.snaps.suppressWarnings = true;

    checkManifestMock.mockResolvedValueOnce({
      errors: [],
      warnings: ['foo', 'bar'],
    } as unknown as CheckManifestResult);

    await manifestHandler(getMockArgv({ writeManifest: false }));

    expect(logWarning).toHaveBeenCalledTimes(1);
  });

  it('forwards manifest errors', async () => {
    checkManifestMock.mockRejectedValueOnce('foo');

    await expect(manifestHandler(getMockArgv())).rejects.toThrow(
      'Manifest Error: foo',
    );
  });
});
