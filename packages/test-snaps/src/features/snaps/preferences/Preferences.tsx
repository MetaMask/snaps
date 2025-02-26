import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import {
  PREFERENCES_SNAP_ID,
  PREFERENCES_SNAP_PORT,
  PREFERENCES_VERSION,
} from './constants';
import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';

export const Preferences: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(PREFERENCES_SNAP_ID, PREFERENCES_SNAP_PORT),
      method: 'getPreferences',
    }).catch(logError);
  };

  return (
    <Snap
      name="Preferences Snap"
      snapId={PREFERENCES_SNAP_ID}
      port={PREFERENCES_SNAP_PORT}
      version={PREFERENCES_VERSION}
      testId="preferences"
    >
      <Button
        variant="primary"
        id="getPreferences"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Submit
      </Button>
      <Result>
        <span id="preferencesResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
