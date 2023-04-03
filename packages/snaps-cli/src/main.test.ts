import * as cliModule from './cli';
import commands from './cmds';

describe('main', () => {
  it('executes the CLI application', async () => {
    jest.spyOn(cliModule, 'cli').mockResolvedValue(undefined);

    await import('./main');

    expect(cliModule.cli).toHaveBeenCalledTimes(1);
    expect(cliModule.cli).toHaveBeenCalledWith(process.argv, commands);
    expect(global.snaps).toStrictEqual({
      // see test/setup.js
      verboseErrors: false,
      suppressWarnings: false,
      isWatching: false,
    });
  });
});
