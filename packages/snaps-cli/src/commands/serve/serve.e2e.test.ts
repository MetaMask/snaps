import type { TestRunner } from '@metamask/snaps-cli/test-utils';
import { getCommandRunner } from '@metamask/snaps-cli/test-utils';
import fetch from 'cross-fetch';

describe('mm-snap serve', () => {
  let runner: TestRunner;

  afterEach(() => {
    runner?.kill();
  });

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
      runner = getCommandRunner(command, ['--port', port]);
      await runner.waitForStdout();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(
          /The server is listening on http:\/\/localhost:\d+\./u,
        ),
      );

      const result = await fetch(`http://localhost:${port}/snap.manifest.json`);
      expect(result.ok).toBe(true);
      expect(result.headers.get('Cache-Control')).toBe('no-cache');
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
    },
  );
});
