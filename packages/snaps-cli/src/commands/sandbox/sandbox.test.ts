import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { DEFAULT_SNAP_BUNDLE } from '@metamask/snaps-utils/test-utils';
import fs from 'fs';

import { sandboxHandler } from './sandbox';
import { build } from '../build';

jest.mock('fs');
jest.mock('./server', () => ({
  startSandbox: jest.fn().mockResolvedValue({ port: 8080 }),
}));
jest.mock('../build/implementation');
jest.mock('../eval');

describe('sandboxHandler', () => {
  it('builds the Snap if the build option is `true`', async () => {
    await fs.promises.writeFile('/input.js', DEFAULT_SNAP_BUNDLE);

    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    await sandboxHandler(config, {});

    expect(process.exitCode).not.toBe(1);
    expect(build).toHaveBeenCalledWith(config, {
      analyze: false,
      evaluate: false,
      spinner: expect.any(Object),
    });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Sandbox running at http://localhost:8080.'),
    );
  });

  it('does not build the Snap if the build option is `false`', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    const config = getMockConfig({
      input: '/input.js',
      output: {
        path: '/foo',
        filename: 'output.js',
      },
    });

    await sandboxHandler(config, { build: false });

    expect(process.exitCode).not.toBe(1);
    expect(build).not.toHaveBeenCalled();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Sandbox running at http://localhost:8080.'),
    );
  });
});
