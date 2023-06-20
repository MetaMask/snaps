import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-ui';

describe('onTransaction', () => {
  it('returns transaction insights for an ERC-20 transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      // This is not a valid ERC-20 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([text('**Transaction type:**'), text('ERC-20')]),
    );

    await close();
  });

  it('returns transaction insights for an ERC-721 transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      // This is not a valid ERC-721 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0x23b872dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([text('**Transaction type:**'), text('ERC-721')]),
    );

    await close();
  });

  it('returns transaction insights for an ERC-1155 transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      // This is not a valid ERC-1155 transfer as all the values are zero, but
      // it is enough to test the `onTransaction` handler.
      data: '0xf242432a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([text('**Transaction type:**'), text('ERC-1155')]),
    );

    await close();
  });

  it('returns transaction insights for an unknown transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      data: '0xabcdef1200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([text('**Transaction type:**'), text('Unknown')]),
    );

    await close();
  });

  it('returns transaction insights for a transaction with no data', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      data: '0x',
    });

    expect(response).toRender(
      panel([text('**Transaction type:**'), text('Unknown')]),
    );

    await close();
  });
});
