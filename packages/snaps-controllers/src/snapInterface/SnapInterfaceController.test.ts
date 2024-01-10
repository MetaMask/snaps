import { form, input } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getRestrictedSnapInterfaceControllerMessenger,
  getRootSnapInterfaceControllerMessenger,
} from '../test-utils';
import { SnapInterfaceController } from './SnapInterfaceController';

describe('SnapInterfaceController', () => {
  describe('createInterface', () => {
    it('can create a new interface', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = snapInterfaceController.createInterface(
        MOCK_SNAP_ID,
        components,
      );

      const { content, state } = snapInterfaceController.getInterface(
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(components);
      expect(state).toStrictEqual({ foo: { bar: null } });
    });
  });

  describe('getInterface', () => {
    it('gets the interface', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = snapInterfaceController.createInterface(
        MOCK_SNAP_ID,
        components,
      );

      const { content } = snapInterfaceController.getInterface(
        MOCK_SNAP_ID,
        id,
      );
      expect(content).toStrictEqual(components);
    });

    it('throws if the snap requesting the interface is not the one that created it', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = snapInterfaceController.createInterface(
        MOCK_SNAP_ID,
        components,
      );

      expect(() => snapInterfaceController.getInterface('foo', id)).toThrow(
        `Interface not created by foo.`,
      );
    });

    it('throws if the interface does not exist', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      expect(() =>
        snapInterfaceController.getInterface(MOCK_SNAP_ID, 'test'),
      ).toThrow(`Interface with id 'test' not found.`);
    });
  });

  describe('updateInterface', () => {
    it('can update an interface', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
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

      const id = snapInterfaceController.createInterface(
        MOCK_SNAP_ID,
        components,
      );

      snapInterfaceController.updateInterface(MOCK_SNAP_ID, id, newContent);

      const { content, state } = snapInterfaceController.getInterface(
        MOCK_SNAP_ID,
        id,
      );

      expect(content).toStrictEqual(newContent);
      expect(state).toStrictEqual({ foo: { baz: null } });
    });

    it('throws if the interface does not exist', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      expect(() =>
        snapInterfaceController.updateInterface(MOCK_SNAP_ID, 'foo', content),
      ).toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = snapInterfaceController.createInterface(MOCK_SNAP_ID, content);

      expect(() =>
        snapInterfaceController.updateInterface('foo', id, newContent),
      ).toThrow('Interface not created by foo.');
    });
  });

  describe('updateInterfaceState', () => {
    it('updates the interface state', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newState = { foo: { bar: 'baz' } };

      const id = snapInterfaceController.createInterface(MOCK_SNAP_ID, content);

      snapInterfaceController.updateInterfaceState(id, newState);

      const { state } = snapInterfaceController.getInterface(MOCK_SNAP_ID, id);

      expect(state).toStrictEqual(newState);
    });
  });

  describe('deleteInterface', () => {
    it('can delete an interface', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      const snapInterfaceController = new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = snapInterfaceController.createInterface(MOCK_SNAP_ID, content);

      snapInterfaceController.deleteInterface(id);

      expect(() =>
        snapInterfaceController.getInterface(MOCK_SNAP_ID, id),
      ).toThrow(`Interface with id '${id}' not found.`);
    });
  });
});
