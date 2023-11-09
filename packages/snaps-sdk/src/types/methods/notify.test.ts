import { NotificationType } from './notify';

describe('NotificationType', () => {
  it('has the correct values', () => {
    expect(Object.values(NotificationType)).toHaveLength(2);
    expect(NotificationType.InApp).toBe('inApp');
    expect(NotificationType.Native).toBe('native');
  });
});
