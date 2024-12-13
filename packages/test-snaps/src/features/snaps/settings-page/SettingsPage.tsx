import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useInvokeMutation } from 'src/api';
import { getSnapId } from 'src/utils';

import { Result, Snap } from '../../../components';
import {
  SETTINGS_PAGE_SNAP_ID,
  SETTINGS_PAGE_SNAP_PORT,
  SETTINGS_PAGE_VERSION,
} from './constants';

export const SettingsPage: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();
  const snapId = getSnapId(SETTINGS_PAGE_SNAP_ID, SETTINGS_PAGE_SNAP_PORT);

  const handleSubmit = () => {
    invokeSnap({
      snapId,
      method: 'getSettings',
    }).catch(logError);
  };
  return (
    <Snap
      name="Settings Page Snap"
      snapId={SETTINGS_PAGE_SNAP_ID}
      port={SETTINGS_PAGE_SNAP_PORT}
      version={SETTINGS_PAGE_VERSION}
      testId="settingspage"
    >
      <Button
        id="settings-state"
        onClick={handleSubmit}
        disabled={isLoading}
        className="mb-3"
      >
        Get settings state
      </Button>

      <Result>
        <span id="settingsResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </Snap>
  );
};
