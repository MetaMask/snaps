import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  it('returns "Hello, world!" and does not throw an error', async () => {
    const { request, close } = await installSnap();

    const response = request({
      method: 'foo',
    });

    expect(await response).toRespondWith('Hello, world!');

    await close();
  });
});
