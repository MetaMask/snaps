import { assert } from '@metamask/utils';
import { createRoot } from 'react-dom/client';

import { setWindowApi } from './api';
import { App } from './App';
import { Root } from './components';
import { createStore } from './store';

// eslint-disable-next-line import/no-unassigned-import
import './assets/fonts/fonts.css';

const rootElement = document.getElementById('root');
assert(rootElement, 'Root element not found.');

const store = createStore();
const root = createRoot(rootElement);

setWindowApi(store);

root.render(
  <Root store={store}>
    <App />
  </Root>,
);
