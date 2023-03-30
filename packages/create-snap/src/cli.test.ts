import { cli } from './cli';
import { init } from './cmds';

const getMockArgv = (...args: string[]) => {
  return ['/mock/path', '/mock/entry/path', ...args];
};

const HELP_TEXT_REGEX = /^\s*create-metamask-snap \[directory\]/u;

describe('cli', () => {
  let consoleLogSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeAll(() => {
    global.snaps = {};
  });

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log');
    processExitSpy = jest.spyOn(process, 'exit');
  });

  afterAll(() => {
    delete (global as any).snaps;
  });

  it('exits if no argument was provided', () => {
    consoleLogSpy.mockImplementationOnce((message: string) => {
      expect(message).toMatch(HELP_TEXT_REGEX);
    });

    processExitSpy.mockImplementationOnce(() => {
      throw new Error('process exited');
    });

    expect(() => cli(getMockArgv('--help'))).toThrow('process exited');
  });

  it('calls "help" command', async () => {
    processExitSpy.mockImplementationOnce((code: number) => {
      expect(code).toBe(0);
    });

    await new Promise<void>((resolve) => {
      consoleLogSpy.mockImplementationOnce((message: string) => {
        expect(message).toMatch(HELP_TEXT_REGEX);
        resolve();
      });

      cli(getMockArgv('--help'));
    });
  });

  describe('command failures', () => {
    it('handles an argument validation failure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockInitHandler = jest.fn();

      cli(getMockArgv('--non-existent-option'), {
        ...init,
        handler: mockInitHandler,
      });

      expect(process.exitCode).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
    it('handles an error thrown by a locally defined command handler', () => {
      expect(() =>
        cli(getMockArgv('foo'), {
          ...init,
          handler: () => {
            throw new Error('init failed');
          },
        }),
      ).toThrow('init failed');
    });
  });
});
