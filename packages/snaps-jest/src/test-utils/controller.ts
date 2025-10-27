import { PhishingDetectorResultType } from '@metamask/phishing-controller';
import type { RootControllerAllowedActions } from '@metamask/snaps-simulation';
import { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';

export const getRootControllerMessenger = (mocked = true) => {
  const messenger = new MockControllerMessenger<
    RootControllerAllowedActions,
    any
  >();

  if (mocked) {
    messenger.registerActionHandler('PhishingController:testOrigin', () => ({
      result: false,
      type: PhishingDetectorResultType.All,
    }));

    messenger.registerActionHandler(
      'ExecutionService:handleRpcRequest',
      jest.fn(),
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
