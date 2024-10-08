import { type EnumToUnion } from '../../internals';
import type {
  AddressElement,
  BoldElement,
  BoxElement,
  CopyableElement,
  DividerElement,
  IconElement,
  ImageElement,
  ItalicElement,
  LinkElement,
  RowElement,
  TextElement,
  TooltipElement,
  ValueElement,
} from '../../jsx';

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
      content: NotificationComponent;
      title: string;
    }
  | {
      type: EnumToUnion<NotificationType.InApp>;
      message: string;
      content: NotificationComponent;
      title: string;
      footerLink: { href: string; text: string };
    };

/**
 * The result returned by the `snap_notify` method.
 *
 * This method does not return anything.
 */
export type NotifyResult = null;

export type NotificationComponent =
  | BoxElement
  | CopyableElement
  | BoldElement
  | ItalicElement
  | AddressElement
  | DividerElement
  | ValueElement
  | RowElement
  | TextElement
  | TooltipElement
  | IconElement
  | ImageElement
  | LinkElement;
