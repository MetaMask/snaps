import { expect, describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text, row } from '@metamask/snaps-sdk';

// The Snaps E2E testing framework doesn't currently support onSignature, so we unit
// test it instead.
describe('onSignature', () => {
  it('returns custom UI', async () => {
    const { onSignature } = await installSnap();

    const response = await onSignature({
      from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      data: '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
    });

    const screen = response.getInterface();

    expect(screen).toRender(
      panel([
        row('From:', text('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')),
        row(
          'Data:',
          text(
            '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
          ),
        ),
      ]),
    );
  });
});
