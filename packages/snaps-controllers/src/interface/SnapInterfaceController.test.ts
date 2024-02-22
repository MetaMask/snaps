import type { SnapId } from '@metamask/snaps-sdk';
import { form, input, panel, text } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getRestrictedSnapInterfaceControllerMessenger,
  getRootSnapInterfaceControllerMessenger,
} from '../test-utils';
import { SnapInterfaceController } from './SnapInterfaceController';

describe('SnapInterfaceController', () => {
  describe('createInterface', () => {
    it('can create a new interface', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([
        text('[foo](https://foo.bar)'),
        form({
          name: 'foo',
          children: [input({ name: 'bar' })],
        }),
      ]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      const { content, state } = rootMessenger.call(
        'SnapInterfaceController:getInterface',
        MOCK_SNAP_ID,
        id,
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        3,
        'PhishingController:testOrigin',
        'foo.bar',
      );

      expect(content).toStrictEqual(components);
      expect(state).toStrictEqual({ foo: { bar: null } });
    });

    it('throws if a link is on the phishing list', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      rootMessenger.registerActionHandler(
        'PhishingController:maybeUpdateState',
        jest.fn(),
      );

      rootMessenger.registerActionHandler(
        'PhishingController:testOrigin',
        () => ({ result: true, type: 'all' }),
      );

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([
        text('[foo](https://foo.bar)'),
        form({
          name: 'foo',
          children: [input({ name: 'bar' })],
        }),
      ]);

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          components,
        ),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        2,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        3,
        'PhishingController:testOrigin',
        'foo.bar',
      );
    });

    it('throws if UI content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([text('[foo](https://foo.bar)'.repeat(100000))]);

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          components,
        ),
      ).rejects.toThrow('A Snap UI may not be larger than 250 kB.');
    });

    it('throws if text content is too large', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = panel([text('[foo](https://foo.bar)'.repeat(2500))]);

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:createInterface',
          MOCK_SNAP_ID,
          components,
        ),
      ).rejects.toThrow('The text in a Snap UI may not be larger than 50 kB.');
    });
  });

  describe('getInterface', () => {
    it('gets the interface', async () => {
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

      const id = await rootMessenger.call(
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

    it('throws if the snap requesting the interface is not the one that created it', async () => {
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

      const id = await rootMessenger.call(
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
    it('can update an interface', async () => {
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

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await rootMessenger.call(
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

    it('throws if a link is on the phishing list', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
        rootMessenger,
        false,
      );

      rootMessenger.registerActionHandler(
        'PhishingController:maybeUpdateState',
        jest.fn(),
      );

      rootMessenger.registerActionHandler(
        'PhishingController:testOrigin',
        () => ({ result: true, type: 'all' }),
      );

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const components = form({
        name: 'foo',
        children: [input({ name: 'bar' })],
      });

      const newContent = panel([
        text('[foo](https://foo.bar)'),
        form({
          name: 'foo',
          children: [input({ name: 'baz' })],
        }),
      ]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newContent,
        ),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        4,
        'PhishingController:maybeUpdateState',
      );

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        5,
        'PhishingController:testOrigin',
        'foo.bar',
      );
    });

    it('throws if UI content is too large', async () => {
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

      const newContent = panel([text('[foo](https://foo.bar)'.repeat(100000))]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newContent,
        ),
      ).rejects.toThrow('A Snap UI may not be larger than 250 kB.');
    });

    it('throws if text content is too large', async () => {
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

      const newContent = panel([text('[foo](https://foo.bar)'.repeat(2500))]);

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        components,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          id,
          newContent,
        ),
      ).rejects.toThrow('The text in a Snap UI may not be larger than 50 kB.');
    });

    it('throws if the interface does not exist', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          MOCK_SNAP_ID,
          'foo',
          content,
        ),
      ).rejects.toThrow("Interface with id 'foo' not found.");
    });

    it('throws if the interface is updated by another snap', async () => {
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

      const id = await rootMessenger.call(
        'SnapInterfaceController:createInterface',
        MOCK_SNAP_ID,
        content,
      );

      await expect(
        rootMessenger.call(
          'SnapInterfaceController:updateInterface',
          'foo' as SnapId,
          id,
          newContent,
        ),
      ).rejects.toThrow('Interface not created by foo.');
    });
  });

  describe('updateInterfaceState', () => {
    it('updates the interface state', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const newState = { foo: { bar: 'baz' } };

      const id = await rootMessenger.call(
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
    it('can delete an interface', async () => {
      const rootMessenger = getRootSnapInterfaceControllerMessenger();
      const controllerMessenger =
        getRestrictedSnapInterfaceControllerMessenger(rootMessenger);

      /* eslint-disable-next-line no-new */
      new SnapInterfaceController({
        messenger: controllerMessenger,
      });

      const content = form({ name: 'foo', children: [input({ name: 'bar' })] });

      const id = await rootMessenger.call(
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
