import { form, input } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getRestrictedInterfaceControllerMessenger,
  getRootInterfaceControllerMessenger,
} from '../test-utils';
import { InterfaceController } from './InterfaceController';

describe('InterfaceController', () => {
  describe('createInterface', () => {
    it('can create a new interface', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = interfaceController.createInterface(MOCK_SNAP_ID, components);

      const { content, state } = interfaceController.getInterface(
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(components);
      expect(state).toStrictEqual({ foo: { bar: null } });
    });
  });

  describe('getInterface', () => {
    it('gets the interface', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = interfaceController.createInterface(MOCK_SNAP_ID, components);

      const { content } = interfaceController.getInterface(MOCK_SNAP_ID, id);
      expect(content).toStrictEqual(components);
    });

    it('throws if the snap requesting the interface is not the one that created it', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = interfaceController.createInterface(MOCK_SNAP_ID, components);

      expect(() => interfaceController.getInterface('foo', id)).toThrow(
        `Interface not created by foo.`,
      );
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
        interfaceController.getInterface(MOCK_SNAP_ID, 'test'),
      ).toThrow(`Interface with id 'test' not found.`);
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

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = interfaceController.createInterface(MOCK_SNAP_ID, components);

      const result = interfaceController.updateInterface(
        MOCK_SNAP_ID,
        id,
        newContent,
      );

      const { content, state } = interfaceController.getInterface(
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(newContent);
      expect(state).toStrictEqual({ foo: { baz: null } });

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

      const id = interfaceController.createInterface(MOCK_SNAP_ID, content);

      expect(() =>
        interfaceController.updateInterface('foo', id, newContent),
      ).toThrow('Interface not created by foo.');
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

      const id = interfaceController.createInterface(MOCK_SNAP_ID, content);

      interfaceController.updateInterfaceState(id, newState);

      const { state } = interfaceController.getInterface(MOCK_SNAP_ID, id);

      expect(state).toStrictEqual(newState);
    });
  });

  describe('deleteInterface', () => {
    it('can delete an interface', () => {
      const rootMessenger = getRootInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedInterfaceControllerMessenger(
        rootMessenger,
        true,
      );

      const interfaceController = new InterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = interfaceController.createInterface(MOCK_SNAP_ID, content);

      interfaceController.deleteInterface(id);

      expect(() => interfaceController.getInterface(MOCK_SNAP_ID, id)).toThrow(
        `Interface with id '${id}' not found.`,
      );
    });
  });
});
