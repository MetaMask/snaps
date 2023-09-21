import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import {
  NAME_LOOKUP_SNAP_ID,
  NAME_LOOKUP_SNAP_PORT,
  NAME_LOOKUP_VERSION,
} from './constants';

export const NameLookup: FunctionComponent = () => {
  return (
    <Snap
      name="Name Lookup Snap"
      snapId={NAME_LOOKUP_SNAP_ID}
      port={NAME_LOOKUP_SNAP_PORT}
      version={NAME_LOOKUP_VERSION}
      testId="name-lookup"
    />
  );
};
