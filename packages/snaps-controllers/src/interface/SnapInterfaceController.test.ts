import type { SnapId } from '@metamask/snaps-sdk';
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

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
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

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      const { content } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );
      expect(content).toStrictEqual(components);
    });

    it('throws if the snap requesting the interface is not the one that created it', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:getInterface',
          'foo' as SnapId,
          id,
        ),
      ).toThrow(`Interface not created by foo.`);
    });

    it('throws if the interface does not exist', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:getInterface',
          MOCK_SNAP_ID,
          'test',
        ),
      ).toThrow(`Interface with id 'test' not found.`);
    });
  });

  describe('updateInterface', () => {
    it('can update an interface', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
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

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      rootMessenger.call(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        id,
        newContent,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
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

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          'foo',
          content,
        ),
      ).toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newContent = form({
        name: 'foo',
        children: [input({ name: 'baz' })],
      });

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          'foo' as SnapId,
          id,
          newContent,
        ),
      ).toThrow('Interface not created by foo.');
    });
  });

  describe('updateInterfaceState', () => {
    it('updates the interface state', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newState = { foo: { bar: 'baz' } };

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      rootMessenger.call(
        'SnapInterfaceController:updateInterfaceState',
        id,
        newState,
      );

      const { state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(state).toStrictEqual(newState);
    });
  });

  describe('deleteInterface', () => {
    it('can delete an interface', () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      rootMessenger.call('SnapInterfaceController:deleteInterface', id);

      expect(() =>
        rootMessenger.call(
          'SnapInterfaceController:getInterface',
          MOCK_SNAP_ID,
          id,
        ),
      ).toThrow(`Interface with id '${id}' not found.`);
    });
  });
});
