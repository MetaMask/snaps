import type { FunctionComponent } from 'react';

import { Fullscreen } from './components/index.js';
import { InstallFlow } from './features/install-flow/InstallFlow.js';

export const App: FunctionComponent = () => {
  return (
    <Fullscreen>
      <InstallFlow />
    </Fullscreen>
  );
};
