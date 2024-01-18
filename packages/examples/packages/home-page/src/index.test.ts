import { describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text, heading } from '@metamask/snaps-sdk';

describe('onHomePage', () => {
  it('returns custom UI', async () => {
    const { getHomePage } = await installSnap();

    const response = await getHomePage();

    expect(response).toRender(
      panel([heading('Hello world!'), text('Welcome to my Snap home page!')]),
    );
  });
});
