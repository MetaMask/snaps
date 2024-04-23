import { describe, expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Bold, Box, Text } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    });
  });

  describe('showAlert', () => {
    it('shows an alert dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showAlert',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'alert');

      expect(ui).toRender(
        <Box>
          <Text>
            Hello from <Bold>JSX</Bold>.
          </Text>
        </Box>,
      );

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });
});
