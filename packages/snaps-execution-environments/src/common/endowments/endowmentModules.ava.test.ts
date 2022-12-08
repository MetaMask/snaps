// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import test from 'ava';
// FinalizationRegistry will fix type errors in tests related to network endowment.
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-unused-vars
import FinalizationRegistry from 'globals';

import buildCommonEndowments from './commonEndowmentFactory';

// Note: harden is only defined after calling lockdown
lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
});

const modules = buildCommonEndowments();

test('endowments modules have expected properties', (expect) => {
  expect.snapshot(modules);
});
