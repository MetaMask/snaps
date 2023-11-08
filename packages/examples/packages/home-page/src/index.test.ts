import { describe, it } from '@jest/globals';
import { panel, text, heading } from '@metamask/snaps-ui';

import { onHomePage } from '.';

// snaps-jest doesn't currently support onHomePage, so we test it manually.
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
