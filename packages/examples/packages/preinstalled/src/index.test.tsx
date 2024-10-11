import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

import { Dialog, Result } from './components';

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

  describe('showDialog', () => {
    it('closes the dialog when clicking cancel, and resolves with `null`', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showDialog',
      });

      const formScreen = await response.getInterface();
      expect(formScreen).toRender(<Dialog />);

      await formScreen.clickElement('cancel');

      const result = await response;
      expect(result).toRespondWith(null);
    });

    it('shows the result when clicking confirm, and resolves with the result', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showDialog',
      });

      const formScreen = await response.getInterface();
      expect(formScreen).toRender(<Dialog />);

      await formScreen.typeInField('custom-input', 'foo bar');
      await formScreen.clickElement('confirm');

      const resultScreen = await response.getInterface();
      expect(resultScreen).toRender(<Result value="foo bar" />);

      await resultScreen.clickElement('ok');

      const result = await response;
      expect(result).toRespondWith('foo bar');
    });
  });
});
