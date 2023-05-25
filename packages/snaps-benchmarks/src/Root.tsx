import { ChakraProvider } from '@chakra-ui/react';
import { assert } from '@metamask/utils';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { App } from './App';
import { createStore } from './store';

const rootElement = document.getElementById('root');
assert(rootElement, 'Root element not found.');

const store = createStore();
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </Provider>
  </StrictMode>,
);
