import { getMockConfig } from '@metamask/snaps-cli/test-utils';

import command from '.';
import { build } from './build';

jest.mock('./build');

describe('build command', () => {
  it('calls the build function', async () => {
    const config = getMockConfig('webpack');

    // @ts-expect-error - Partial `YargsArgs` is fine for testing.
    await command.handler({ context: { config } });

    expect(build).toHaveBeenCalledWith(config);
  });
});
