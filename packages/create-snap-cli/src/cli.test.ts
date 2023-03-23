import { cli } from './cli';
import * as initHandlerModule from './cmds/init/initHandler';

const getMockArgv = (...args: string[]) => {
  return ['/mock/path', '/mock/entry/path', ...args];
};

// The ".+" is because the CLI name (specified to yargs as "$0") is
// populated programmatically based on the name of entry point file.
// In Jest, that's sometimes "childProcess.js", sometimes other things.
// In practice, it should always be "mm-snap".
const HELP_TEXT_REGEX = /^\s*Usage: .+ <command> \[options\]/u;

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
    it('handles an error thrown by a locally defined command handler', () => {
      jest.spyOn(initHandlerModule, 'initHandler').mockImplementation(() => {
        throw new Error('init failed');
      });
      expect(() => cli(getMockArgv('init'))).toThrow('init failed');
    });
  });
});
