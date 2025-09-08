import { Messenger } from '@metamask/messenger';
import { PhishingDetectorResultType } from '@metamask/phishing-controller';
import type { SnapInterfaceControllerAllowedActions } from '@metamask/snaps-controllers';
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
  const controllerMessenger = new Messenger<
    'SnapInterfaceController',
    SnapInterfaceControllerAllowedActions,
    never,
    any
  >({
    namespace: 'SnapInterfaceController',
    parent: messenger,
  });

  messenger.delegate({
    messenger: controllerMessenger,
    actions: [
      'PhishingController:testOrigin',
      'ApprovalController:hasRequest',
      'ApprovalController:acceptRequest',
      'AccountsController:getAccountByAddress',
      'AccountsController:getSelectedMultichainAccount',
      'AccountsController:listMultichainAccounts',
      'MultichainAssetsController:getState',
    ],
    events: ['NotificationServicesController:notificationsListUpdated'],
  });

  return controllerMessenger;
};
