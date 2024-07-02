import { addons } from '@storybook/manager-api';

import { theme } from './theme/storybook';

// Modify the Storybook theme to match MetaMask's theme.
addons.setConfig({
  theme,
});
