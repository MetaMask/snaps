import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import {
  CRONJOBS_SNAP_ID,
  CRONJOBS_SNAP_PORT,
  CRONJOBS_VERSION,
} from './constants';

export const Cronjobs: FunctionComponent = () => {
  return (
    <Snap
      name="Cronjobs Snap"
      snapId={CRONJOBS_SNAP_ID}
      port={CRONJOBS_SNAP_PORT}
      version={CRONJOBS_VERSION}
      testId="cronjobs"
    ></Snap>
  );
};
