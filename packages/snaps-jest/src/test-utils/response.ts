import type { JSXElement } from '@metamask/snaps-sdk/jsx';

import type { SnapHandlerInterface, SnapResponse } from '../types';

/**
 * Get a mock response.
 *
 * @param options - The options to use.
 * @param options.id - The ID to use.
 * @param options.response - The response to use.
 * @param options.notifications - The notifications to use.
 * @returns The mock response.
 */
export function getMockResponse({
  id = 'foo',
  response = {
    result: 'foo',
  },
  notifications = [],
}: Partial<SnapResponse>): SnapResponse {
  return {
    id,
    response,
    notifications,
  };
}

/**
 * Get a mock handler interface.
 *
 * @param content - The content to use.
 * @returns The mock handler interface.
 */
export function getMockInterfaceResponse(
  content: JSXElement,
): SnapHandlerInterface {
  return {
    content,
    clickElement: jest.fn(),
    typeInField: jest.fn(),
  };
}
