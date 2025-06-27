import type { FunctionComponent } from 'react';

import { Fullscreen } from './components';
import { Install } from './features/install/Install.js';

export const App: FunctionComponent = () => {
  return (
    <Fullscreen>
      <Install />
    </Fullscreen>
  );
};
