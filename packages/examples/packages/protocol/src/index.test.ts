import { describe, expect, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

const SCOPE = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';

describe('onProtocolRequest', () => {
  it('returns the block height', async () => {
    const { onProtocolRequest } = await installSnap();
    const response = await onProtocolRequest(SCOPE, {
      method: 'getBlockHeight',
    });

    expect(response).toRespondWith(expect.any(Number));
  });
});
