import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import {
  PROTOCOL_SNAP_ID,
  PROTOCOL_SNAP_PORT,
  PROTOCOL_VERSION,
} from './constants';

export const Protocol: FunctionComponent = () => {
  return (
    <Snap
      name="Protocol Snap"
      snapId={PROTOCOL_SNAP_ID}
      port={PROTOCOL_SNAP_PORT}
      version={PROTOCOL_VERSION}
      testId="protocol"
    />
  );
};
