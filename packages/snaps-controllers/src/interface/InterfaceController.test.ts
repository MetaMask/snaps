import { form, input } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getRestrictedInterfaceControllerMessenger,
  getRootInterfaceControllerMessenger,
} from '../test-utils';
import {
  INTERFACE_APPROVAL_TYPE,
  InterfaceController,
} from './InterfaceController';

describe('InterfaceController', () => {
  describe('showInterface', () => {
    it('can show a new interface', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      expect(rootMessenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          origin: MOCK_SNAP_ID,
          id: expect.any(String),
          type: INTERFACE_APPROVAL_TYPE,
          requestData: {},
          requestState: {
            content,
            state: {
              foo: {
                bar: null,
              },
            },
          },
        },
        true,
      );

      expect(id).toBeDefined();
    });
  });

  describe('updateInterface', () => {
    it('can update an interface', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      const result = interfaceController.updateInterface(
        MOCK_SNAP_ID,
        id,
        newContent,
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:updateRequestState',
        {
          id,
          requestState: {
            content: newContent,
            state: { foo: { baz: null } },
          },
        },
      );

      expect(result).toBeNull();
    });

    it('throws if the interface does not exist', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      expect(() =>
        interfaceController.updateInterface(MOCK_SNAP_ID, 'foo', content),
      ).toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      expect(() =>
        interfaceController.updateInterface('foo', id, newContent),
      ).toThrow('Interface not created by foo.');
    });
  });

  describe('resolveInterface', () => {
    it('resolves an interface', async () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      const resolvedValue = 'foo';

      const result = await interfaceController.resolveInterface(
        MOCK_SNAP_ID,
        id,
        resolvedValue,
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:acceptRequest',
        id,
        resolvedValue,
      );

      expect(result).toBeNull();
    });

    it('throws if the interface does not exist', async () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      await expect(
        interfaceController.resolveInterface(MOCK_SNAP_ID, 'foo', null),
      ).rejects.toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', async () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      await expect(
        interfaceController.resolveInterface('foo', id, null),
      ).rejects.toThrow('Interface not created by foo.');
    });
  });

  describe('readInterface', () => {
    it('gets the interface promise', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      const result = interfaceController.readInterface(MOCK_SNAP_ID, id);

      expect(result).toBeInstanceOf(Promise);
    });

    it('throws if the interface does not exist', async () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      await expect(
        interfaceController.readInterface(MOCK_SNAP_ID, 'foo'),
      ).rejects.toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', async () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      await expect(
        interfaceController.readInterface('foo', id),
      ).rejects.toThrow('Interface not created by foo.');
    });
  });

  describe('updateInterfaceState', () => {
    it('updates the interface state', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newState = { foo: { bar: 'baz' } };

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      interfaceController.updateInterfaceState(id, newState);

      const result = interfaceController.getInterfaceState(MOCK_SNAP_ID, id);

      expect(result).toStrictEqual(newState);
    });
  });

  describe('getInterfaceState', () => {
    it('gets the interface state', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      const result = interfaceController.getInterfaceState(MOCK_SNAP_ID, id);

      expect(result).toStrictEqual({ foo: { bar: null } });
    });

    it('throws if the interface does not exist', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      expect(() =>
        interfaceController.getInterfaceState(MOCK_SNAP_ID, 'foo'),
      ).toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.showInterface(MOCK_SNAP_ID, content);

      expect(() => interfaceController.getInterfaceState('foo', id)).toThrow(
        'Interface not created by foo.',
      );
    });
  });
});
