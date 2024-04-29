import { describe, expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { assert } from '@metamask/utils';

import { Counter } from './components';

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

  describe('display', () => {
    it('shows a dialog with a counter and an increment button', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'display',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'alert');

      expect(ui).toRender(<Counter count={0} />);

      await ui.clickElement('increment');

      const updatedUi = await response.getInterface();
      expect(updatedUi).toRender(<Counter count={1} />);

      await updatedUi.ok();

      expect(await response).toRespondWith(null);
    });
  });
});
