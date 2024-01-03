import { UserInputEventTypes } from './user-input';

describe('UserInputEventTypes', () => {
  it('has the correct values', () => {
    expect(Object.values(UserInputEventTypes)).toHaveLength(2);
    expect(UserInputEventTypes.ButtonClickEvent).toBe('ButtonClickEvent');
    expect(UserInputEventTypes.FormSubmitEvent).toBe('FormSubmitEvent');
  });
});
