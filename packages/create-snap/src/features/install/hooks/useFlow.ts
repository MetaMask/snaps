import { useContext } from 'react';

import { FlowReactContext } from '../components/Flow.js';

/**
 * Access the {@link Flow} context. This hook must be used within a
 * {@link Flow} component.
 *
 * @returns The current flow context.
 */
export function useFlow() {
  return useContext(FlowReactContext);
}
