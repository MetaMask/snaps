import { describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

import { SettingsPage } from './components/SettingsPage';

describe('onSettingsPage', () => {
  it('returns custom UI', async () => {
    const { onSettingsPage } = await installSnap();

    const response = await onSettingsPage();

    const screen = response.getInterface();

    expect(screen).toRender(<SettingsPage />);
  });
});

describe('onRpcRequest', () => {
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
});
