import { UserInputEventType } from './user-input';

describe('UserInputEventType', () => {
  it('has the correct values', () => {
    expect(Object.values(UserInputEventType)).toHaveLength(3);
    expect(UserInputEventType.ButtonClickEvent).toBe('ButtonClickEvent');
    expect(UserInputEventType.FormSubmitEvent).toBe('FormSubmitEvent');
    expect(UserInputEventType.InputChangeEvent).toBe('InputChangeEvent');
  });
});
