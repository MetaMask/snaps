import { FunctionComponent } from 'react';

import { CRONJOBS_SNAP_ID, CRONJOBS_SNAP_PORT } from './constants';
import { Snap } from '../../../components';

export const Cronjobs: FunctionComponent = () => {
  return (
    <Snap
      name="Cronjobs Snap"
      snapId={CRONJOBS_SNAP_ID}
      port={CRONJOBS_SNAP_PORT}
      testId="cronjobs"
    ></Snap>
  );
};
