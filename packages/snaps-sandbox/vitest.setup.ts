import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// eslint-disable-next-line import-x/no-unassigned-import
import '@testing-library/jest-dom/vitest';

// This is needed for `act` to work properly in the test environment.
// @ts-expect-error: `IS_REACT_ACT_ENVIRONMENT` does not exist on `globalThis`.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
