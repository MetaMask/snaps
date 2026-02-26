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
 * An object containing the parameters for the `snap_notify` method.
 */
export type NotifyParams =
  | {
      /**
       * The literal string "native" to indicate that this is a native OS
       * notification. We recommend using `inApp` instead, as native
       * notifications may be rate-limited by the operating system.
       */
      type: EnumToUnion<NotificationType.Native>;

      /**
       * The message to display in the notification.
       */
      message: string;
    }
  | {
      /**
       * The literal string "inApp" to indicate that this is an in-app
       * notification displayed in the MetaMask UI.
       */
      type: EnumToUnion<NotificationType.InApp>;

      /**
       * The message to display in the notification.
       */
      message: string;
    }
  | {
      /**
       * The literal string "inApp" to indicate that this is an in-app
       * notification displayed in the MetaMask UI.
       */
      type: EnumToUnion<NotificationType.InApp>;

      /**
       * A short summary shown in the notification list.
       */
      message: string;

      /**
       * The custom UI content to display when the notification is expanded.
       */
      content: ComponentOrElement;

      /**
       * The title of the expanded notification.
       */
      title: string;

      /**
       * An optional link to display in the footer of the expanded notification.
       */
      footerLink?: {
        /**
         * The URL to navigate to when the link is clicked.
         */
        href: string;

        /**
         * The link text to display.
         */
        text: string;
      };
    };

/**
 * This method does not return any data, so the result is always `null`.
 */
export type NotifyResult = null;
