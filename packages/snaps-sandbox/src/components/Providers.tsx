import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { createStore } from 'jotai';
import { Provider } from 'jotai';
import type { FunctionComponent, ReactNode } from 'react';

import { store as defaultStore } from '../state';
import { system } from '../theme';

/**
 * The query client used by `@tanstack/react-query`.
 */
export const defaultQueryClient = new QueryClient();

/**
 * The props for the {@link Providers} component.
 */
export type ProvidersProps = {
  /**
   * The Jotai store to use. Defaults to the store created in `state.ts`.
   */
  store?: ReturnType<typeof createStore>;

  /**
   * The QueryClient to use. Defaults to a new `QueryClient`.
   */
  queryClient?: QueryClient;

  /**
   * The children of the component.
   */
  children: ReactNode;
};

/**
 * A component that provides the necessary context for the application.
 *
 * @param props - The component props.
 * @param props.store - The Jotai store to use. Defaults to the store created in
 * `state.ts`.
 * @param props.queryClient - The QueryClient to use. Defaults to a new
 * `QueryClient`.
 * @param props.children - The children of the component.
 * @returns The providers component.
 */
export const Providers: FunctionComponent<ProvidersProps> = ({
  store = defaultStore,
  queryClient = defaultQueryClient,
  children,
}) => {
  return (
    <Provider store={store}>
      <ChakraProvider value={system}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ChakraProvider>
    </Provider>
  );
};
