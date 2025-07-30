import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

import { Dialog, Result, Settings } from './components';

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

  describe('getSettings', () => {
    it('returns the settings state', async () => {
      const { request, onSettingsPage } = await installSnap();

      const settingPageResponse = await onSettingsPage();

      const screen = settingPageResponse.getInterface();

      await screen.clickElement('setting1');

      await screen.selectFromRadioGroup('setting2', 'option1');

      await screen.selectInDropdown('setting3', 'option2');

      expect(
        await request({
          method: 'getSettings',
        }),
      ).toRespondWith({
        setting1: true,
        setting2: 'option1',
        setting3: 'option2',
      });
    });
  });

  describe('trackError', () => {
    it('tracks an error', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'trackError',
      });

      expect(response).toRespondWith(null);
      expect(response).toTrackError(
        expect.objectContaining({
          name: 'TestError',
          message: 'This is a test error.',
        }),
      );
    });
  });

  describe('trackEvent', () => {
    it('tracks an event', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'trackEvent',
      });

      expect(response).toRespondWith(null);
      expect(response).toTrackEvent({
        event: 'Test Event',
        properties: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          test_property: 'test value',
        },
      });
    });
  });

  describe('trace', () => {
    it('starts and ends a trace', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'trace',
      });

      expect(response).toRespondWith(null);
      expect(response).toTrace({
        name: 'Test Snap Trace',
      });
    });
  });
});

describe('onSettingsPage', () => {
  it('returns custom UI', async () => {
    const { onSettingsPage } = await installSnap();

    const response = await onSettingsPage();

    const screen = response.getInterface();

    expect(screen).toRender(<Settings />);
  });
});
