import { cli } from './cli';
import { init } from './cmds';

const getMockArgv = (...args: string[]) => {
  return ['/mock/path', '/mock/entry/path', ...args];
};

const HELP_TEXT_REGEX = /^\s*Usage: .+ \[directory-name\]/u;

describe('cli', () => {
  let consoleLogSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeAll(() => {
    global.snaps = {};
  });

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log');
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterAll(() => {
    delete (global as any).snaps;
  });

  it('exits if no argument was provided', async () => {
    consoleLogSpy.mockImplementationOnce((message: string) => {
      expect(message).toMatch(HELP_TEXT_REGEX);
    });

    processExitSpy.mockImplementationOnce(() => {
      throw new Error('process exited');
    });

    await expect(cli(getMockArgv('--help'))).rejects.toThrow('process exited');
  });

  it('calls "help" command', async () => {
    expect.assertions(2);
    processExitSpy.mockImplementationOnce((code: number) => {
      expect(code).toBe(0);
    });

    await cli(getMockArgv('--help'));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(HELP_TEXT_REGEX),
    );
  });

  describe('command failures', () => {
    it('handles an argument validation failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockInitHandler = jest.fn();

      await cli(getMockArgv('--non-existent-option'), {
        ...init,
        handler: mockInitHandler,
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    });

    it('handles an error thrown by a locally defined command handler', async () => {
      await expect(
        cli(getMockArgv('foo'), {
          ...init,
          handler: () => {
            throw new Error('init failed');
          },
        }),
      ).rejects.toThrow('init failed');
    });
  });
});
