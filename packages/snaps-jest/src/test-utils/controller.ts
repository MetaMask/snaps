import type { SnapInterfaceControllerAllowedActions } from '@metamask/snaps-controllers';
import { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';

import type { RootControllerAllowedActions } from '../internals/simulation/controllers';

export const getRootControllerMessenger = (mocked = true) => {
  const messenger = new MockControllerMessenger<
    RootControllerAllowedActions,
    any
  >();

  if (mocked) {
    messenger.registerActionHandler(
      'PhishingController:maybeUpdateState',
      async () => Promise.resolve(),
    );

    messenger.registerActionHandler('PhishingController:testOrigin', () => ({
      result: false,
      type: 'all',
    }));
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
    never
  >({
    name: 'SnapInterfaceController',
    allowedActions: [
      'PhishingController:testOrigin',
      'PhishingController:maybeUpdateState',
    ],
  });

  return snapInterfaceControllerMessenger;
};
