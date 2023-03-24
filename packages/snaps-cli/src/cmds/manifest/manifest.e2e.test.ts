import { run } from '../../test-utils';

describe('mm-snap manifest', () => {
  it.each(['manifest', 'm'])(
    'validates the manifest using "mm-snap %s"',
    async (command) => {
      await run({
        command,
      })
        .code(0)
        .end();
    },
  );
});
