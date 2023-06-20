import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { evalBundle, isFile } from '@metamask/snaps-utils';
import { resolve } from 'path';

import { evaluate } from './eval';

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  evalBundle: jest.fn(),
  isFile: jest.fn(),
}));

describe('evaluate', () => {
  it('evaluates the bundle using Webpack', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;

    const isFileMock = isFile as jest.MockedFunction<typeof isFile>;
    isFileMock.mockResolvedValueOnce(true);

    await evaluate(getMockConfig('webpack'));

    expect(evalBundleMock).toHaveBeenCalledWith(
      resolve(process.cwd(), 'dist/bundle.js'),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /Snap bundle ".*" successfully evaluated in SES\./u,
      ),
    );
  });

  it('evaluates the bundle using Browserify', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;

    const isFileMock = isFile as jest.MockedFunction<typeof isFile>;
    isFileMock.mockResolvedValueOnce(true);

    await evaluate(getMockConfig('webpack'));

    expect(evalBundleMock).toHaveBeenCalledWith(
      resolve(process.cwd(), 'dist/bundle.js'),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /Snap bundle ".*" successfully evaluated in SES\./u,
      ),
    );
  });

  it('evaluates the bundle using the --input flag', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;

    const isFileMock = isFile as jest.MockedFunction<typeof isFile>;
    isFileMock.mockResolvedValueOnce(true);

    await evaluate(getMockConfig('webpack'), { input: 'foo/bar.js' });

    expect(evalBundleMock).toHaveBeenCalledWith(
      resolve(process.cwd(), 'foo/bar.js'),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /Snap bundle ".*" successfully evaluated in SES\./u,
      ),
    );
  });

  it('throws an error if the eval fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;
    evalBundleMock.mockRejectedValueOnce(new Error('Eval error.'));

    const isFileMock = isFile as jest.MockedFunction<typeof isFile>;
    isFileMock.mockResolvedValueOnce(true);

    await expect(evaluate(getMockConfig('webpack'))).rejects.toThrow(
      /Failed to evaluate snap bundle ".*" in SES: Eval error\./u,
    );

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
