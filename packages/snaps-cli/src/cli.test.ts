import type yargs from 'yargs';

import { cli } from './cli';
import commands from './commands';

jest.mock('./config');

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
  it('exits if no argument was provided', async () => {
    expect.assertions(2);

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    consoleLogSpy.mockImplementationOnce((message: string) => {
      expect(message).toMatch(HELP_TEXT_REGEX);
    });

    // @ts-expect-error `process.exit` returns `never`, but we can't mock that.
    processExitSpy.mockImplementationOnce((code?: number | undefined): void => {
      expect(code).toBe(0);
    });

    await cli(getMockArgv('--help'), commands);
  });

  it('calls "help" command', async () => {
    expect.assertions(2);

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // @ts-expect-error `process.exit` returns `never`, but we can't mock that.
    processExitSpy.mockImplementationOnce((code: number) => {
      expect(code).toBe(0);
    });

    await new Promise<void>((resolve, reject) => {
      consoleLogSpy.mockImplementationOnce((message: string) => {
        expect(message).toMatch(HELP_TEXT_REGEX);
        resolve();
      });

      cli(getMockArgv('--help'), commands).catch(reject);
    });
  });

  // Commands are fully tested in their respective unit tests.
  // This is just to ensure full coverage of cli.ts.
  describe('locally defined commands', () => {
    Object.keys(commandMap).forEach((command) => {
      it(`calls ${sanitizeCommand(command)}`, async () => {
        const mockCommandHandler = jest.fn();

        const finished = new Promise<void>((resolve) => {
          mockCommandHandler.mockImplementation(() => resolve() as any);
        });

        await cli(getMockArgv(sanitizeCommand(command)), [
          { ...(commandMap as any)[command], handler: mockCommandHandler },
        ]);
        await finished;

        expect(mockCommandHandler).toHaveBeenCalledTimes(1);
        expect(mockCommandHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _: [sanitizeCommand(command)],
          }),
        );
      });
    });
  });

  describe('command failures', () => {
    it('handles an argument validation failure for a locally defined command', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      const mockServeHandler = jest.fn();

      await cli(
        getMockArgv(
          'serve',
          '--port',
          'not-a-number',
          '--verboseErrors',
          'false',
        ),
        [{ ...commandMap.serve, handler: mockServeHandler }],
      );

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('Invalid port: "NaN".'),
      );
      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockServeHandler).not.toHaveBeenCalled();
    });

    it('handles an argument validation failure for a locally defined command, with verbose errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
      const mockServeHandler = jest.fn();

      await cli(
        getMockArgv('serve', '--port', 'not-a-number', `--verboseErrors`),
        [{ ...commandMap.serve, handler: mockServeHandler }],
      );

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('Invalid port: "NaN".'),
      );
      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockServeHandler).not.toHaveBeenCalled();
    });

    it('handles an error thrown by a locally defined command handler', async () => {
      jest.spyOn(process, 'exit').mockImplementation();

      const mockBuildHandler = jest.fn().mockImplementation(() => {
        throw new Error('Build failed.');
      });

      await expect(
        cli(getMockArgv('build'), [
          { ...commandMap.build, handler: mockBuildHandler },
        ]),
      ).rejects.toThrow('Build failed.');
    });
  });
});
