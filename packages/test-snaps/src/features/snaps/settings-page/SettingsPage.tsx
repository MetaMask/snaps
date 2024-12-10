import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import {
  SETTINGS_PAGE_SNAP_ID,
  SETTINGS_PAGE_SNAP_PORT,
  SETTINGS_PAGE_VERSION,
} from './constants';

export const SettingsPage: FunctionComponent = () => {
  return (
    <Snap
      name="Settings Page Snap"
      snapId={SETTINGS_PAGE_SNAP_ID}
      port={SETTINGS_PAGE_SNAP_PORT}
      version={SETTINGS_PAGE_VERSION}
      testId="settingspage"
    />
  );
};
