import { ControllerMessenger } from '@metamask/base-controller';
import { SnapInterfaceController } from '@metamask/snaps-controllers';

import { registerActions } from '../sagas';

/**
 * Get the SnapInterfaceController.
 *
 * @returns The {@link SnapInterfaceController}.
 */
export function getSnapInterfaceController() {
  const messenger = new ControllerMessenger<any, any>();

  registerActions(messenger);

  return new SnapInterfaceController({
    messenger: messenger.getRestricted({
      name: 'SnapInterfaceController',
      allowedActions: [
        'PhishingController:maybeUpdateState',
        'PhishingController:testOrigin',
      ],
      allowedEvents: [],
    }),
  });
}
