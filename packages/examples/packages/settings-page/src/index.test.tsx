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
