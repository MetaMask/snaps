import { expectTypeOf } from 'expect-type';

import type { NotifyParams } from './notify';
import { NotificationType } from './notify';

describe('NotificationType', () => {
  it('has the correct values', () => {
    expect(Object.values(NotificationType)).toHaveLength(2);
    expect(NotificationType.InApp).toBe('inApp');
    expect(NotificationType.Native).toBe('native');
  });
});

describe('NotifyParams', () => {
  it('accepts the type as enum', () => {
    expectTypeOf<{
      type: NotificationType.InApp;
      message: string;
    }>().toMatchTypeOf<NotifyParams>();
  });

  it('accepts the type as string', () => {
    expectTypeOf<{
      type: 'inApp';
      message: string;
    }>().toMatchTypeOf<NotifyParams>();
  });
});
