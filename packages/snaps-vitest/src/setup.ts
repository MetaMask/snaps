// Setup file for Vitest. This file registers the Snaps matchers, and is used in
// the Vitest configuration. It is not intended to be used directly.

import { expect } from 'vitest';

import { matchers } from './matchers';

expect.extend(matchers);
