import { getMockConfig } from '@metamask/snaps-cli/test-utils';

import command from '.';
import { buildHandler } from './build';

jest.mock('./build');

describe('build command', () => {
  it('calls the `buildHandler` function', async () => {
    const config = getMockConfig('webpack');

    // @ts-expect-error - Partial `YargsArgs` is fine for testing.
    await command.handler({ context: { config } });

    expect(buildHandler).toHaveBeenCalledWith(config);
  });
});
