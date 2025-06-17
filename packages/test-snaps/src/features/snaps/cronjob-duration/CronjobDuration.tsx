import type { FunctionComponent } from 'react';

import {
  CRONJOB_DURATION_SNAP_ID,
  CRONJOB_DURATION_SNAP_PORT,
  CRONJOB_DURATION_VERSION,
} from './constants';
import { Snap } from '../../../components';

export const CronjobDuration: FunctionComponent = () => {
  return (
    <Snap
      name="Cronjob Duration Snap"
      snapId={CRONJOB_DURATION_SNAP_ID}
      port={CRONJOB_DURATION_SNAP_PORT}
      version={CRONJOB_DURATION_VERSION}
      testId="cronjob-duration"
    />
  );
};
