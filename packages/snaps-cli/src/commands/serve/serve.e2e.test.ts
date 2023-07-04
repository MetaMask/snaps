import { getCommandRunner } from '@metamask/snaps-cli/test-utils';

describe('mm-snap serve', () => {
  it.each([
    {
      command: 'serve',
      port: '8086',
    },
    {
      command: 's',
      port: '8087',
    },
  ])(
    'serves a snap over HTTP on port $port using "mm-snap $command --port $port"',
    async ({ command, port }) => {
      const runner = getCommandRunner(command, ['--port', port]);
      await runner.waitForStdout();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(
        /The server is listening on http:\/\/localhost:\d+\./u,
      );

      const result = await fetch(`http://localhost:${port}/snap.manifest.json`);
      expect(result.ok).toBe(true);

      runner.kill();
    },
  );
});
