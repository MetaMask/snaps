import { useState, type FunctionComponent } from 'react';

import { Snap } from '../../../components';
import { CreateDialog, GetInterfaceState } from './components';
import {
  INTERACTIVE_UI_SNAP_ID,
  INTERACTIVE_UI_SNAP_PORT,
  INTERACTIVE_UI_VERSION,
} from './constants';

export const InteractiveUI: FunctionComponent = () => {
  const [interfaceId, setInterfaceId] = useState<string>();

  return (
    <Snap
      name="Interactive UI Snap"
      snapId={INTERACTIVE_UI_SNAP_ID}
      port={INTERACTIVE_UI_SNAP_PORT}
      version={INTERACTIVE_UI_VERSION}
      testId="interactive-ui"
    >
      <CreateDialog setInterfaceId={setInterfaceId} />
      <GetInterfaceState interfaceId={interfaceId} />
    </Snap>
  );
};
