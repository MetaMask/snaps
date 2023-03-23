import * as cliModule from './cli';

jest.mock('./cli', () => ({
  cli: jest.fn(),
}));

describe('main', () => {
  it('executes the CLI application', async () => {
    await import('./main');
    expect(cliModule.cli).toHaveBeenCalledTimes(1);
    expect(cliModule.cli).toHaveBeenCalledWith(process.argv);
    expect(global.snaps).toStrictEqual({
      // see test/setup.js
      verboseErrors: false,
      suppressWarnings: false,
      isWatching: false,
    });
  });
});
