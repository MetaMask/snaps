import type { FunctionComponent } from 'react';

import {
  CancelBackgroundEvent,
  ScheduleBackgroundEvent,
  GetBackgroundEvents,
} from './components';
import {
  CRONJOBS_SNAP_ID,
  CRONJOBS_SNAP_PORT,
  CRONJOBS_VERSION,
} from './constants';
import { Snap } from '../../../components';

export const Cronjobs: FunctionComponent = () => {
  return (
    <Snap
      name="Cronjobs Snap"
      snapId={CRONJOBS_SNAP_ID}
      port={CRONJOBS_SNAP_PORT}
      version={CRONJOBS_VERSION}
      testId="cronjobs"
    >
      <GetBackgroundEvents />
      <ScheduleBackgroundEvent />
      <CancelBackgroundEvent />
    </Snap>
  );
};
