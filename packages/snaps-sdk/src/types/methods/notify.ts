import type { EnumToUnion } from '../../internals';

export enum NotificationType {
  InApp = 'inApp',
  Native = 'native',
}

export type Notify = {
  type: EnumToUnion<NotificationType>;
  message: string;
};

/**
 * The request parameters for the `snap_notify` method.
 *
 * @property type - The type of notification to display.
 * @property message - The message to display in the notification.
 */
export type NotifyParams = Notify;

/**
 * The result returned by the `snap_notify` method.
 *
 * This method does not return anything.
 */
export type NotifyResult = null;
