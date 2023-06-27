import { FunctionComponent } from 'react';

import { Snap } from '../../components';

const CRONJOB_SNAP_ID = 'npm:@metamask/test-snap-cronjob';
const CRONJOB_SNAP_PORT = 8010;

export const Cronjob: FunctionComponent = () => {
  return (
    <Snap
      name="Cronjob Snap"
      snapId={CRONJOB_SNAP_ID}
      port={CRONJOB_SNAP_PORT}
      testId="CronjobSnap"
    ></Snap>
  );
};
