import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { evalBundle } from '@metamask/snaps-utils';
import { resolve } from 'path';

import { evaluate } from './eval';

jest.mock('@metamask/snaps-utils', () => ({
  ...jest.requireActual('@metamask/snaps-utils'),
  evalBundle: jest.fn(),
}));

describe('evaluate', () => {
  it('evaluates the bundle using Webpack', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;

    await evaluate(getMockConfig('webpack'));

    expect(evalBundleMock).toHaveBeenCalledWith(
      resolve(process.cwd(), 'dist/bundle.js'),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Snap bundle "dist/bundle.js" successfully evaluated in SES.',
    );
  });

  it('evaluates the bundle using Browserify', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;

    await evaluate(getMockConfig('webpack'));

    expect(evalBundleMock).toHaveBeenCalledWith(
      resolve(process.cwd(), 'dist/bundle.js'),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Snap bundle "dist/bundle.js" successfully evaluated in SES.',
    );
  });

  it('throws an error if the eval fails', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const evalBundleMock = evalBundle as jest.MockedFunction<typeof evalBundle>;
    evalBundleMock.mockRejectedValueOnce(new Error('Eval error.'));

    await expect(evaluate(getMockConfig('webpack'))).rejects.toThrow(
      'Failed to evaluate snap bundle "dist/bundle.js" in SES: Eval error.',
    );

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
