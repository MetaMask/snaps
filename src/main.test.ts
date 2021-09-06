import * as cliModule from './cli';
import { commandModules } from './cmds';

jest.mock('./cli', () => ({
  cli: jest.fn(),
}));

describe('main', () => {
  it('executes the CLI application', async () => {
    await import('./main');
    expect(cliModule.cli).toHaveBeenCalledTimes(1);
    expect(cliModule.cli).toHaveBeenCalledWith(process.argv, commandModules);
    expect(global.snaps).toStrictEqual({
      verboseErrors: false,
      suppressWarnings: false,
      isWatching: false,
    });
  });
});
