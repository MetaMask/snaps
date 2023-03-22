import { run } from '@metamask/snaps-cli/test-utils';
import { WaitType } from 'clet';
import fetch from 'cross-fetch';

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
    'serves a snap over HTTP on port $port using "mm-snap $command"',
    async ({ command, port }) => {
      expect.assertions(1);

      await run({
        command,
        options: [`--port ${port}`],
      })
        .wait('stdout' as WaitType, 'Starting server...')
        .wait(
          'stdout' as WaitType,
          `Server listening on: http://localhost:${port}`,
        )
        // The types are inaccurate: `tap` supports `async` functions.
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .tap(async () => {
          const response = await fetch(`http://localhost:${port}`);
          expect(response.ok).toBe(true);
        })
        .kill()
        .end();
    },
  );
});
