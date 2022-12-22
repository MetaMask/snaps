// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import test from 'ava';

import timeout from './timeout';

test.before(() => {
  lockdown({
    domainTaming: 'unsafe',
    errorTaming: 'unsafe',
    stackFiltering: 'verbose',
  });
});

test('modifying setTimeout handler should not be allowed and error should be thrown', (expect) => {
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

test('modifying setTimeout endowment properties should result with throwing an error', (expect) => {
  const { setTimeout: _setTimeout } = timeout.factory();

  expect.throws(
    () => {
      // @ts-expect-error Ignore because this is supposed to cause an error
      _setTimeout.whatever = 'something';
    },
    {
      message: `Cannot add property whatever, object is not extensible`,
    },
  );
});

test('modifying clearTimeout endowment properties should result with throwing an error', (expect) => {
  const { clearTimeout: _clearTimeout } = timeout.factory();

  expect.throws(
    () => {
      // @ts-expect-error Ignore because this is supposed to cause an error
      _clearTimeout.whatever = 'something';
    },
    {
      message: `Cannot add property whatever, object is not extensible`,
    },
  );
});
