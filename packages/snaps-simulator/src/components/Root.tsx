import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import type { FunctionComponent, ReactElement } from 'react';
import { StrictMode } from 'react';
import { DndProvider } from 'react-dnd';
import { Provider } from 'react-redux';

import { Notifications } from '../features';
import type { createStore } from '../store';
import { theme } from '../theme';

export type RootProps = {
  store: ReturnType<typeof createStore>;
  children: ReactElement;
};

/**
 * Render the root component. This is the top-level component that wraps the
 * entire application.
 *
 * @param props - The props.
 * @param props.store - The Redux store.
 * @param props.children - The children to render.
 * @returns The root component.
 */
export const Root: FunctionComponent<RootProps> = ({ store, children }) => (
  <StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
          <Notifications />
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          {children}
        </DndProvider>
      </ChakraProvider>
    </Provider>
  </StrictMode>
);
