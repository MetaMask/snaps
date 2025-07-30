import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type {
  SnapHandlerInterface,
  SnapResponse,
  SnapResponseWithInterface,
} from '@metamask/snaps-simulation';

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
  },
  getInterface,
}: Omit<Partial<SnapResponseWithInterface>, 'tracked'> & {
  tracked?: {
    errors?: SnapResponse['tracked']['errors'];
    events?: SnapResponse['tracked']['events'];
  };
}): SnapResponse {
  return {
    id,
    response,
    notifications,
    tracked: {
      errors: [],
      events: [],
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
    clickElement: jest.fn(),
    typeInField: jest.fn(),
    selectInDropdown: jest.fn(),
    selectFromRadioGroup: jest.fn(),
    selectFromSelector: jest.fn(),
    uploadFile: jest.fn(),
    waitForUpdate: jest.fn(),
  };
}
