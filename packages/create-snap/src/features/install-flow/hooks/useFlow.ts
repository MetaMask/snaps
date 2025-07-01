import type { Context } from 'react';
import { useContext } from 'react';

import type { FlowContext } from '../components/Flow.js';
import { FlowReactContext } from '../components/Flow.js';

/**
 * Access the {@link Flow} context. This hook must be used within a
 * {@link Flow} component.
 *
 * @returns The current flow context.
 * @template Type The type of the flow context.
 */
export function useFlow<Type = unknown>() {
  return useContext(FlowReactContext as Context<FlowContext<Type>>);
}
