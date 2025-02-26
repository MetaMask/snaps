import type { FunctionComponent } from 'react';

import {
  PROTOCOL_SNAP_ID,
  PROTOCOL_SNAP_PORT,
  PROTOCOL_VERSION,
} from './constants';
import { Snap } from '../../../components';

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
