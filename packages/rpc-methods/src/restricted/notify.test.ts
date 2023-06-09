import { PermissionType, SubjectType } from '@metamask/permission-controller';

import {
  getImplementation,
  getValidatedParams,
  NotificationType,
  specificationBuilder,
} from './notify';

describe('snap_notify', () => {
  const validParams = {
    type: NotificationType.InApp,
    message: 'Some message',
  };

  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        showNativeNotification: jest.fn(),
        showInAppNotification: jest.fn(),
      };

      expect(
        specificationBuilder({
          allowedCaveats: null,
          methodHooks,
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
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
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

      expect(showInAppNotification).toHaveBeenCalledWith('extension', {
        type: NotificationType.InApp,
        message: 'Some message',
      });
    });

    it('shows native notification', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
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

      expect(showNativeNotification).toHaveBeenCalledWith('extension', {
        type: NotificationType.Native,
        message: 'Some message',
      });
    });

    it('accepts string notification types', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
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

      expect(showNativeNotification).toHaveBeenCalledWith('extension', {
        type: NotificationType.Native,
        message: 'Some message',
      });
    });

    it('throws an error if the notification type is invalid', async () => {
      const showNativeNotification = jest.fn().mockResolvedValueOnce(true);
      const showInAppNotification = jest.fn().mockResolvedValueOnce(true);

      const notificationImplementation = getImplementation({
        showNativeNotification,
        showInAppNotification,
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
      expect(() => getValidatedParams([])).toThrow(
        'Expected params to be a single object.',
      );
    });

    it('throws an error if the type is missing from params object', () => {
      expect(() =>
        getValidatedParams({ type: undefined, message: 'Something happened.' }),
      ).toThrow('Must specify a valid notification "type".');
    });

    it('throws an error if the message is empty', () => {
      expect(() =>
        getValidatedParams({ type: NotificationType.InApp, message: '' }),
      ).toThrow(
        'Must specify a non-empty string "message" less than 50 characters long.',
      );
    });

    it('throws an error if the message is not a string', () => {
      expect(() =>
        getValidatedParams({ type: NotificationType.InApp, message: 123 }),
      ).toThrow(
        'Must specify a non-empty string "message" less than 50 characters long.',
      );
    });

    it('throws an error if the message is larger than 50 characters', () => {
      expect(() =>
        getValidatedParams({
          type: NotificationType.InApp,
          message:
            'test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg_test_msg',
        }),
      ).toThrow(
        'Must specify a non-empty string "message" less than 50 characters long.',
      );
    });

    it('returns valid parameters', () => {
      expect(getValidatedParams(validParams)).toStrictEqual(validParams);
    });
  });
});
