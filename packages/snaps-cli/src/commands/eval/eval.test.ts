import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { DEFAULT_SNAP_BUNDLE } from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';
import ora from 'ora';

import { evaluateHandler } from './eval';
import { evaluate } from './implementation';

jest.mock('fs');
jest.mock('./implementation');

describe('evaluateHandler', () => {
  beforeAll(async () => {
    await fs.mkdir('/foo', { recursive: true });
    await fs.writeFile('/foo/output.js', DEFAULT_SNAP_BUNDLE);
  });

  it('evaluates the bundle using Webpack', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/');
    jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('webpack', {
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    await evaluateHandler(config);

    expect(evaluate).toHaveBeenCalledWith(
      expect.stringMatching(/.*output\.js.*/u),
    );

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;
    expect(spinner.succeed).toHaveBeenCalledWith(
      'Snap bundle evaluated successfully.',
    );
  });

  it('evaluates the bundle using Browserify', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/');
    jest.spyOn(console, 'log').mockImplementation();

    await evaluateHandler(
      getMockConfig('browserify', {
        cliOptions: {
          bundle: '/foo/output.js',
        },
      }),
    );

    expect(evaluate).toHaveBeenCalledWith(
      expect.stringMatching(/.*output\.js.*/u),
    );

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;
    expect(spinner.succeed).toHaveBeenCalledWith(
      'Snap bundle evaluated successfully.',
    );
  });

  it('evaluates the bundle using the --input flag', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/');
    jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('webpack', {
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'bar.js',
      },
    });

    await evaluateHandler(config, { input: '/foo/output.js' });

    expect(evaluate).toHaveBeenCalledWith(
      expect.stringMatching(/.*output\.js.*/u),
    );

    const { mock } = ora as jest.MockedFunction<typeof ora>;
    const spinner = mock.results[0].value;
    expect(spinner.succeed).toHaveBeenCalledWith(
      'Snap bundle evaluated successfully.',
    );
  });

  it('throws an error if the input file is not found', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/');
    const log = jest.spyOn(console, 'error').mockImplementation();

    const config = getMockConfig('webpack', {
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'bar.js',
      },
    });

    await evaluateHandler(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(
        /Input file not found: ".*"\. Make sure that the "input" field in your snap config or the specified input file is correct\./u,
      ),
    );
  });

  it('throws an error if the eval fails', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/');
    const log = jest.spyOn(console, 'error').mockImplementation();

    const mock = evaluate as jest.MockedFunction<typeof evaluate>;
    mock.mockRejectedValueOnce(new Error('Eval error.'));

    const config = getMockConfig('webpack', {
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    await evaluateHandler(config);

    expect(log).toHaveBeenCalledWith(expect.stringContaining('Eval error.'));
  });
});
