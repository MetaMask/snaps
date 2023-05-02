import yargs from 'yargs';

import { cli } from './cli';
import commands from './cmds';

// Removes positional arguments from commands. eg. 'build [directory]' -> 'build'
const sanitizeCommand = (command: string) =>
  command.replace(/(\[.*?\])/u, '').trim();

const commandMap = (commands as unknown as yargs.CommandModule[]).reduce<
  Record<string, yargs.CommandModule>
>((map, commandModule) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  map[sanitizeCommand(commandModule.command![0])] = commandModule;
  return map;
}, {});

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

    expect(() => cli(getMockArgv('--help'), commands)).toThrow(
      'process exited',
    );
  });

  it('calls "help" command', async () => {
    expect.assertions(2);
    processExitSpy.mockImplementationOnce((code: number) => {
      expect(code).toBe(0);
    });

    await new Promise<void>((resolve) => {
      consoleLogSpy.mockImplementationOnce((message: string) => {
        expect(message).toMatch(HELP_TEXT_REGEX);
        resolve();
      });

      cli(getMockArgv('--help'), commands);
    });
  });

  // Commands are fully tested in their respective unit tests.
  // This is just to ensure full coverage of cli.ts.
  describe('locally defined commands', () => {
    beforeEach(() => {
      processExitSpy.mockImplementation();
    });

    Object.keys(commandMap).forEach((command) => {
      it(`calls ${sanitizeCommand(command)}`, async () => {
        const mockCommandHandler = jest.fn();

        const finished = new Promise<void>((resolve) => {
          mockCommandHandler.mockImplementation(() => resolve() as any);
        });

        cli(getMockArgv(sanitizeCommand(command)), [
          { ...(commandMap as any)[command], handler: mockCommandHandler },
        ]);
        await finished;
        expect(mockCommandHandler).toHaveBeenCalledTimes(1);
        // TODO: Test the complete argv for each command
        expect(mockCommandHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _: [sanitizeCommand(command)],
            suppressWarnings: false,
            verboseErrors: true,
          }),
        );
      });
    });
  });

  describe('command failures', () => {
    it('handles an argument validation failure for a locally defined command', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockServeHandler = jest.fn();

      cli(
        getMockArgv(
          'serve',
          '--port',
          'not-a-number',
          '--verboseErrors',
          'false',
        ),
        [{ ...commandMap.serve, handler: mockServeHandler }],
      );

      expect(process.exitCode).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid port: NaN');
      expect(mockServeHandler).not.toHaveBeenCalled();
    });

    it('handles an argument validation failure for a locally defined command, with verbose errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockServeHandler = jest.fn();

      cli(getMockArgv('serve', '--port', 'not-a-number', `--verboseErrors`), [
        { ...commandMap.serve, handler: mockServeHandler },
      ]);

      expect(process.exitCode).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'Invalid port: NaN');
      expect(mockServeHandler).not.toHaveBeenCalled();
    });

    it('handles an error thrown by a locally defined command handler', () => {
      const mockBuildHandler = jest.fn().mockImplementation(() => {
        throw new Error('build failed');
      });

      expect(() =>
        cli(getMockArgv('build'), [
          { ...commandMap.build, handler: mockBuildHandler },
        ]),
      ).toThrow('build failed');
    });
  });
});
