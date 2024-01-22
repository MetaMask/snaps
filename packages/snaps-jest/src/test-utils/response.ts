import type { SnapResponse } from '../types';

/**
 * Get a mock response.
 *
 * @param options - The options to use.
 * @param options.id - The ID to use.
 * @param options.response - The response to use.
 * @param options.notifications - The notifications to use.
 * @param options.content - The content to use.
 * @returns The mock response.
 */
export function getMockResponse({
  id = 'foo',
  response = {
    result: 'foo',
  },
  notifications = [],
  content = undefined,
}: Partial<SnapResponse>): SnapResponse {
  return {
    id,
    response,
    notifications,
    content,
  };
}
