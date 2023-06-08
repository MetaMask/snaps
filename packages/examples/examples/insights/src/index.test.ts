import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { copyable, panel, text } from '@metamask/snaps-ui';

jest.setTimeout(60000);

describe('onTransaction', () => {
  it('returns insights for a transaction', async () => {
    const { sendTransaction, mock } = await installSnap();

    await mock({
      url: 'https://www.4byte.directory/api/v1/signatures/',
      partial: true,
      response: {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 1,
              /* eslint-disable @typescript-eslint/naming-convention */
              created_at: '2021-01-01T00:00:00.000000Z',
              text_signature: 'transfer(address,uint256)',
              hex_signature: '0xa9059cbb',
              /* eslint-enable @typescript-eslint/naming-convention */
            },
          ],
        }),
      },
    });

    const response = await sendTransaction({
      data: '0xa9059cbb000000000000000000000000dde3d2ed021aa02ff90110df1beb708894b4a4e9000000000000000000000000000000000000000000000002b5e3af16b1880000',
    });

    expect(response).toRender(
      panel([
        text('**Type:** transfer(address,uint256)'),
        text('**Args:**'),
        copyable(
          JSON.stringify(
            [
              '0xdde3d2ed021aa02ff90110df1beb708894b4a4e9',
              '50000000000000000000',
            ],
            null,
            2,
          ),
        ),
      ]),
    );
  });
});
