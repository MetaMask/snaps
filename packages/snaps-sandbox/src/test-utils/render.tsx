import type { QueryClient } from '@tanstack/react-query';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
} from '@testing-library/react';
import type { createStore } from 'jotai';
import type { ReactNode } from 'react';

import { Providers } from '../components';

/**
 * The options for the {@link render} function.
 */
export type RenderOptions = {
  /**
   * The Jotai store to use. Defaults to the store created in `state.ts`.
   */
  store?: ReturnType<typeof createStore>;

  /**
   * The QueryClient to use. Defaults to a new `QueryClient`.
   */
  queryClient?: QueryClient;
};

/**
 * Custom render function to wrap components with providers.
 *
 * @param ui - The component to render.
 * @param options - Additional render options.
 * @param options.store - The Jotai store to use. Defaults to the store created
 * in `state.ts`.
 * @param options.queryClient - The QueryClient to use. Defaults to a new
 * `QueryClient`.
 * @returns The rendered component.
 */
export function render(
  ui: ReactNode,
  { store, queryClient }: RenderOptions = {},
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <Providers store={store} queryClient={queryClient}>
        {children}
      </Providers>
    ),
  });
}

/**
 * Custom render function to wrap hooks with providers.
 *
 * @param hook - The hook to render.
 * @param options - Additional render options.
 * @param options.store - The Jotai store to use. Defaults to the store created
 * in `state.ts`.
 * @param options.queryClient - The QueryClient to use. Defaults to a new
 * `QueryClient`.
 * @returns The rendered hook.
 */
export function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  { store, queryClient }: RenderOptions = {},
) {
  return rtlRenderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Providers store={store} queryClient={queryClient}>
        {children}
      </Providers>
    ),
  });
}
