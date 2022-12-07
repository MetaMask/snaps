import test from 'ava';

import timeout from './timeout';

test('modifying handler should not be allowed and error should be thrown', (expect) => {
  const { setTimeout: _setTimeout } = timeout.factory();

  const handle = _setTimeout((param: unknown) => param, 100);

  expect.throws(
    () => {
      // @ts-expect-error Ignore because this is supposed to cause an error
      handle.whatever = 'something';
    },
    {
      message: `Cannot add property whatever, object is not extensible`,
    },
  );
});
