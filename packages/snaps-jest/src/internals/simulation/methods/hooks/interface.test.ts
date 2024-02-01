import { SnapInterfaceController } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { text } from '@metamask/snaps-sdk';

import {
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from '../../../../test-utils';
import {
  getCreateInterfaceImplementation,
  getGetInterfaceImplementation,
} from './interface';

describe('getCreateInterfaceImplementation', () => {
  it('returns the implementation of the `createInterface` hook', async () => {
    const controllerMessenger = getRootControllerMessenger();

    const interfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const fn = getCreateInterfaceImplementation(controllerMessenger);

    const snapId = 'foo' as SnapId;
    const content = text('bar');

    const id = await fn(snapId, content);

    const result = interfaceController.getInterface(snapId, id);

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:createInterface',
      snapId,
      content,
    );
    expect(result.content).toStrictEqual(content);
  });
});

describe('getGetInterfaceImplementation', () => {
  it('returns the implementation of the `getInterface` hook', async () => {
    const controllerMessenger = getRootControllerMessenger();

    const interfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const fn = getGetInterfaceImplementation(controllerMessenger);

    const snapId = 'foo' as SnapId;
    const content = text('bar');

    const id = await interfaceController.createInterface(snapId, content);

    const result = fn(snapId, id);

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:getInterface',
      snapId,
      id,
    );
    expect(result).toStrictEqual({ content, state: {}, snapId });
  });
});
