import type { EnumToUnion } from '../../internals';

export enum NotificationType {
  InApp = 'inApp',
  Native = 'native',
}

export type Notify = {
  type: EnumToUnion<NotificationType>;
  message: string;
};
