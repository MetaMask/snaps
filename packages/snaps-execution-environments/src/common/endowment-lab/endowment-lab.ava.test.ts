// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import test from 'ava';

import abortControllerEndowment from './endowment-lab';

test.before(() => {
  lockdown({
    domainTaming: 'unsafe',
    errorTaming: 'unsafe',
    stackFiltering: 'verbose',
  });
});

test('modifying AbortController endowment properties should result with throwing an error', (expect) => {
  const { AbortController: _AbortController } =
    abortControllerEndowment.factory();

  expect.throws(
    () => {
      // @ts-expect-error Ignore because error is caused intentionally
      _AbortController.whatever = 'something';
    },
    {
      message: `Cannot add property whatever, object is not extensible`,
    },
  );
});

test('modifying AbortController endowment prototype should result with throwing an error', (expect) => {
  const { AbortController: _AbortController } =
    abortControllerEndowment.factory();

  expect.throws(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Ignore because this 'mistake' is intentional
    _AbortController.prototype = { poisoned: 'prototype' };
  });
});
