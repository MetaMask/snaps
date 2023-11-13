import { describe, it } from '@jest/globals';
import { panel, text, heading } from '@metamask/snaps-sdk';

import { onHomePage } from '.';

// The Snaps E2E testing framework doesn't currently support onHomePage, so we unit
// test it instead.
describe('onHomePage', () => {
  it('returns custom UI', async () => {
    expect(await onHomePage()).toStrictEqual({
      content: panel([
        heading('Hello world!'),
        text('Welcome to my Snap home page!'),
      ]),
    });
  });
});
