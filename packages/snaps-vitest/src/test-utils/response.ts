import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type {
  SnapHandlerInterface,
  SnapResponse,
  SnapResponseWithInterface,
} from '@metamask/snaps-simulation';
import { vi } from 'vitest';

/**
 * Get a mock response.
 *
 * @param options - The options to use.
 * @param options.id - The ID to use.
 * @param options.response - The response to use.
 * @param options.notifications - The notifications to use.
 * @param options.tracked - The tracked errors and events to use.
 * @param options.getInterface - The `getInterface` function to use.
 * @returns The mock response.
 */
export function getMockResponse({
  id = 'foo',
  response = {
    result: 'foo',
  },
  notifications = [],
  tracked = {
    errors: [],
    events: [],
    traces: [],
  },
  getInterface,
}: Omit<Partial<SnapResponseWithInterface>, 'tracked'> & {
  tracked?: Partial<SnapResponse['tracked']>;
}): SnapResponse {
  return {
    id,
    response,
    notifications,
    tracked: {
      errors: [],
      events: [],
      traces: [],
      ...tracked,
    },
    ...(getInterface ? { getInterface } : {}),
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
    clickElement: vi.fn(),
    pickDateTime: vi.fn(),
    typeInField: vi.fn(),
    selectInDropdown: vi.fn(),
    selectFromRadioGroup: vi.fn(),
    selectFromSelector: vi.fn(),
    uploadFile: vi.fn(),
    waitForUpdate: vi.fn(),
  };
}
