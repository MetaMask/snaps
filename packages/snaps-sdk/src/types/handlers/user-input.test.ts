import { is } from 'superstruct';

import { FormSubmitEventStruct, UserInputEventType } from './user-input';

describe('UserInputEventType', () => {
  it('has the correct values', () => {
    expect(Object.values(UserInputEventType)).toHaveLength(4);
    expect(UserInputEventType.ButtonClickEvent).toBe('ButtonClickEvent');
    expect(UserInputEventType.FormSubmitEvent).toBe('FormSubmitEvent');
    expect(UserInputEventType.InputChangeEvent).toBe('InputChangeEvent');
    expect(UserInputEventType.FileUploadEvent).toBe('FileUploadEvent');
  });
});

describe('FormSubmitEventStruct', () => {
  it('accepts string values and files', () => {
    expect(
      is(
        {
          type: 'FormSubmitEvent',
          name: 'foo',
          value: {
            file: {
              name: 'consensys.svg',
              size: 791,
              contentType: 'image/svg+xml',
              contents: '...',
            },
            string: 'bar',
          },
        },
        FormSubmitEventStruct,
      ),
    ).toBe(true);
  });
});
