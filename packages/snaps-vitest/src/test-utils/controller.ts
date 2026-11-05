import type { RootControllerAllowedActions } from '@metamask/snaps-simulation';
import { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';
import { vi } from 'vitest';

export const getRootControllerMessenger = (mocked = true) => {
  const messenger = new MockControllerMessenger<
    RootControllerAllowedActions,
    any
  >();

  if (mocked) {
    messenger.registerActionHandler('PhishingController:testOrigin', () => ({
      result: false,
      type: 'all',
    }));

    messenger.registerActionHandler(
      'ExecutionService:handleRpcRequest',
      vi.fn(),
    );

    messenger.registerActionHandler(
      'ApprovalController:hasRequest',
      () => true,
    );

    messenger.registerActionHandler(
      'ApprovalController:acceptRequest',
      async (_id: string, value: unknown) => ({ value }),
    );
  }

  return messenger;
};
