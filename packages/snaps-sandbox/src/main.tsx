import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { Providers } from './components';

// eslint-disable-next-line import-x/no-unassigned-import
import './editor';

// eslint-disable-next-line import-x/no-unassigned-import
import './assets/fonts/fonts.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('No root element found.');
}

createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
