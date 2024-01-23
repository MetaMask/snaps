import { UserInputEventType } from './user-input';

describe('UserInputEventType', () => {
  it('has the correct values', () => {
    expect(Object.values(UserInputEventType)).toHaveLength(2);
    expect(UserInputEventType.ButtonClickEvent).toBe('ButtonClickEvent');
    expect(UserInputEventType.FormSubmitEvent).toBe('FormSubmitEvent');
  });
});
