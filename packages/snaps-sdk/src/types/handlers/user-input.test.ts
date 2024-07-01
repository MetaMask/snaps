import { is } from '@metamask/superstruct';

import {
  FormSubmitEventStruct,
  InputChangeEventStruct,
  UserInputEventType,
} from './user-input';

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
  it('accepts strings, booleans, and files as value', () => {
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
            bool: true,
          },
        },
        FormSubmitEventStruct,
      ),
    ).toBe(true);
  });
});

describe('InputChangeEventStruct', () => {
  it('accepts string values', () => {
    expect(
      is(
        {
          type: 'InputChangeEvent',
          name: 'foo',
          value: 'bar',
        },
        InputChangeEventStruct,
      ),
    ).toBe(true);
  });

  it('accepts boolean values', () => {
    expect(
      is(
        {
          type: 'InputChangeEvent',
          name: 'foo',
          value: true,
        },
        InputChangeEventStruct,
      ),
    ).toBe(true);
  });
});
