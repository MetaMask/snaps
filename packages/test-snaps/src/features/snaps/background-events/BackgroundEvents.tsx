import type { FunctionComponent } from 'react';

import {
  CancelBackgroundEvent,
  ScheduleBackgroundEvent,
  GetBackgroundEvents,
} from './components';
import {
  BACKGROUND_EVENTS_SNAP_ID,
  BACKGROUND_EVENTS_SNAP_PORT,
  BACKGROUND_EVENTS_VERSION,
} from './constants';
import { Snap } from '../../../components';

export const BackgroundEvents: FunctionComponent = () => {
  return (
    <Snap
      name="Background Events Snap"
      snapId={BACKGROUND_EVENTS_SNAP_ID}
      port={BACKGROUND_EVENTS_SNAP_PORT}
      version={BACKGROUND_EVENTS_VERSION}
      testId="background-events"
    >
      <GetBackgroundEvents />
      <ScheduleBackgroundEvent />
      <CancelBackgroundEvent />
    </Snap>
  );
};
