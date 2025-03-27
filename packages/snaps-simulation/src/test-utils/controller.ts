import { PhishingDetectorResultType } from '@metamask/phishing-controller';
import type {
  SnapInterfaceControllerAllowedActions,
  SnapInterfaceControllerEvents,
} from '@metamask/snaps-controllers';
import { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';

import type { RootControllerAllowedActions } from '../controllers';

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

export const getRestrictedSnapInterfaceControllerMessenger = (
  messenger: ReturnType<
    typeof getRootControllerMessenger
  > = getRootControllerMessenger(),
) => {
  const snapInterfaceControllerMessenger = messenger.getRestricted<
    'SnapInterfaceController',
    SnapInterfaceControllerAllowedActions['type'],
    SnapInterfaceControllerEvents['type']
  >({
    name: 'SnapInterfaceController',
    allowedActions: [
      'PhishingController:testOrigin',
      'ApprovalController:hasRequest',
      'ApprovalController:acceptRequest',
    ],
    allowedEvents: ['NotificationServicesController:notificationsListUpdated'],
  });

  return snapInterfaceControllerMessenger;
};
