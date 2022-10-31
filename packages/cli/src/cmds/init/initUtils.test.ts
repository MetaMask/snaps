import fs from 'fs';
import fse from 'fs-extra';

import { prepareWorkingDirectory } from './initUtils';

/**
 * A fake Node.js file system error.
 * Basically, {@link Error} but with a `code` property.
 */
class FakeFsError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    ...jest.requireActual('fs').promises,
    mkdtemp: jest.fn(),
    readdir: jest.fn(),
  },
}));

jest.mock('process', () => ({
  ...jest.requireActual('process'),
  cwd: jest.fn(),
}));

jest.mock('fs-extra');

const fsExtasMock = fse as unknown as jest.Mock;

describe('initUtils', () => {
  describe('prepareWorkingDirectory', () => {
    it('creates a new directory if needed', async () => {
      const cwdMock = jest
        .spyOn(process, 'cwd')
        .mockImplementation(() => 'bar');

      const mkdirpMock = jest.spyOn(fse, 'mkdirp');

      const readdirMock = jest
        .spyOn(fs.promises, 'readdir')
        .mockImplementation(async () => []);

      await prepareWorkingDirectory('foo');

      expect(cwdMock).toHaveBeenCalledTimes(1);
      expect(readdirMock).toHaveBeenCalledTimes(1);
      expect(mkdirpMock).toHaveBeenCalledTimes(1);
    });
  });
});
