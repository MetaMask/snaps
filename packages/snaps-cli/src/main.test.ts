import * as cliModule from './cli';
import commands from './commands';

jest.mock('./cli', () => ({
  cli: jest.fn(),
}));

describe('main', () => {
  it('executes the CLI application', async () => {
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
