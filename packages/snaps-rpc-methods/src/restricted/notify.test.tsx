import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { ContentType, NotificationType } from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

import type { NotifyMessengerActions } from './notify';
import {
  getImplementation,
  getValidatedParams,
  specificationBuilder,
} from './notify';

describe('snap_notify', () => {
  const validParams = {
    type: NotificationType.InApp,
    message: 'Some message',
  };

  const getMessenger = () => {
    const messenger = new Messenger<MockAnyNamespace, NotifyMessengerActions>({
      namespace: MOCK_ANY_NAMESPACE,
    });

    messenger.registerActionHandler(
      'RateLimitController:call',
      async () => true,
    );

    messenger.registerActionHandler(
      'SnapInterfaceController:createInterface',
      () => 'foo',
    );

    messenger.registerActionHandler('SnapController:getSnap', () => null);

    jest.spyOn(messenger, 'call');

    return messenger;
  };

  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        isOnPhishingList: jest.fn(),
        maybeUpdatePhishingList: jest.fn(),
      };

      expect(
        specificationBuilder({
          methodHooks,
          messenger: new Messenger({ namespace: 'Notify' }),
        }),
      ).toStrictEqual({
        allowedCaveats: null,
        methodImplementation: expect.anything(),
        permissionType: PermissionType.RestrictedMethod,
        targetName: 'snap_notify',
        subjectTypes: [SubjectType.Snap],
      });
    });
  });

  describe('getImplementation', () => {
    it('shows inApp notification', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: 'Some message',
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'RateLimitController:call',
        'extension',
        'showInAppNotification',
        'extension',
        {
          interfaceId: undefined,
          message: 'Some message',
          title: undefined,
          footerLink: undefined,
        },
      );
    });

    it('shows inApp notifications with a detailed view', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: NotificationType.InApp,
          message: 'Some message',
          title: 'Detailed view title',
          content: <Text>Hello</Text>,
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapInterfaceController:createInterface',
        'extension',
        <Text>Hello</Text>,
        undefined,
        ContentType.Notification,
      );

      expect(messenger.call).toHaveBeenCalledWith(
        'RateLimitController:call',
        'extension',
        'showInAppNotification',
        'extension',
        {
          interfaceId: 'foo',
          message: 'Some message',
          title: 'Detailed view title',
          footerLink: undefined,
        },
      );
    });

    it('shows native notification', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: NotificationType.Native,
          message: 'Some message',
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'RateLimitController:call',
        'extension',
        'showNativeNotification',
        'extension',
        'Some message',
      );
    });

    it('accepts string notification types', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await notificationImplementation({
        context: {
          origin: 'extension',
        },
        method: 'snap_notify',
        params: {
          type: 'native',
          message: 'Some message',
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'RateLimitController:call',
        'extension',
        'showNativeNotification',
        'extension',
        'Some message',
      );
    });

    it('throws an error if the notification type is invalid', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            // @ts-expect-error - Invalid type for testing purposes.
            type: 'invalid-type',
            message: 'Some message',
          },
        }),
      ).rejects.toThrow('Must specify a valid notification "type".');
    });
  });

  describe('getValidatedParams', () => {
    it('throws an error if the params is not an object', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams([], isOnPhishingList, getMessenger()),
      ).toThrow('Expected params to be a single object.');
    });

    it('throws an error if the type is missing from params object', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          { type: undefined, message: 'Something happened.' },
          isOnPhishingList,
          getMessenger(),
        ),
      ).toThrow('Must specify a valid notification "type".');
    });

    it('throws an error if the message is empty', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          { type: NotificationType.InApp, message: '' },
          isOnPhishingList,
          getMessenger(),
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 500 characters long.',
      );
    });

    it('throws an error if the message is not a string', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          { type: NotificationType.InApp, message: 123 },
          isOnPhishingList,
          getMessenger(),
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 500 characters long.',
      );
    });

    it('throws an error if the message is larger than or equal to 50 characters for native notifications', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          {
            type: NotificationType.Native,
            message: 'test'.repeat(20),
          },
          isOnPhishingList,
          getMessenger(),
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 50 characters long.',
      );
    });

    it('throws an error if the message is larger than or equal to 500 characters for in app notifications', () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      expect(() =>
        getValidatedParams(
          {
            type: NotificationType.InApp,
            message: 'test'.repeat(150),
          },
          isOnPhishingList,
          getMessenger(),
        ),
      ).toThrow(
        'Must specify a non-empty string "message" less than 500 characters long.',
      );
    });

    it('throws an error if a link in the `message` property is on the phishing list', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: '[test link](https://foo.bar)',
          },
        }),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');
    });

    it('throws an error if a link in the `message` property is invalid', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: '[test](http://foo.bar)',
          },
        }),
      ).rejects.toThrow(
        'Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
      );
    });

    it('throws an error if a link in the `footerLink` property is on the phishing list', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      const content = (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      );

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: 'message',
            footerLink: { href: 'https://www.metamask.io', text: 'test' },
            title: 'A title',
            content,
          },
        }),
      ).rejects.toThrow('Invalid URL: The specified URL is not allowed.');
    });

    it('throws an error if a link in the `footerLink` property is invalid', async () => {
      const isOnPhishingList = jest.fn().mockResolvedValue(true);
      const maybeUpdatePhishingList = jest.fn();
      const messenger = getMessenger();

      const notificationImplementation = getImplementation({
        methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
        messenger,
      });

      const content = (
        <Box>
          <Text>Hello, world!</Text>
        </Box>
      );

      await expect(
        notificationImplementation({
          context: {
            origin: 'extension',
          },
          method: 'snap_notify',
          params: {
            type: 'inApp',
            message: 'message',
            footerLink: { href: 'http://foo.bar', text: 'test' },
            title: 'A title',
            content,
          },
        }),
      ).rejects.toThrow(
        'Invalid params: Invalid URL: Protocol must be one of: https:, mailto:, metamask:.',
      );
    });

    it('returns valid parameters', () => {
      const isNotOnPhishingList = jest.fn().mockResolvedValueOnce(false);
      expect(
        getValidatedParams(validParams, isNotOnPhishingList, getMessenger()),
      ).toStrictEqual(validParams);
    });
  });
});
