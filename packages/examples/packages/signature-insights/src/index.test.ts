import { describe, it } from '@jest/globals';
import { panel, text, row, SeverityLevel } from '@metamask/snaps-sdk';

import { onSignature } from '.';

// The Snaps E2E testing framework doesn't currently support onSignature, so we unit
// test it instead.
describe('onSignature', () => {
  it('returns custom UI', async () => {
    expect(
      await onSignature({
        signature: {
          from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          data: '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
          signatureMethod: 'personal_sign',
        },
      }),
    ).toStrictEqual({
      content: panel([
        row('From:', text('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')),
        row(
          'Data:',
          text(
            '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
          ),
        ),
      ]),
      severity: SeverityLevel.Critical,
    });
  });
});
