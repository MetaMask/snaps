import { type EnumToUnion } from '../../internals';
import type { ComponentOrElement } from '../interface';

/**
 * The types of notifications that can be displayed.
 *
 * - `InApp` - A notification that is displayed in by the MetaMask extension.
 * - `Native` - A notification that is displayed by the operating system.
 */
export enum NotificationType {
  InApp = 'inApp',
  Native = 'native',
}

/**
 * The request parameters for the `snap_notify` method.
 *
 * @property type - The type of notification to display.
 * @property message - The message to display in the notification.
 */
export type NotifyParams =
  | {
      type: EnumToUnion<NotificationType.Native>;
      message: string;
    }
  | {
      type: EnumToUnion<NotificationType.InApp>;
      message: string;
    }
  | {
      type: EnumToUnion<NotificationType.InApp>;
      message: string;
      content: ComponentOrElement;
      title: string;
      footerLink?: { href: string; text: string };
    };

/**
 * The result returned by the `snap_notify` method.
 *
 * This method does not return anything.
 */
export type NotifyResult = null;
