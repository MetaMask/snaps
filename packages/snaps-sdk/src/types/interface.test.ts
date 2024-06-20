import { assert } from 'superstruct';

import { FormStateStruct, InterfaceStateStruct } from './interface';

describe('FormStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() =>
      assert(
        {
          type: 'Form',
          value: {
            foo: {
              type: 'Input',
              value: 'bar',
            },
          },
        },
        FormStateStruct,
      ),
    ).not.toThrow();
  });
});

describe('InterfaceStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() =>
      assert(
        {
          test: {
            type: 'Form',
            value: {
              bar: {
                type: 'Input',
                value: 'baz',
              },
            },
          },
          foo: {
            type: 'Input',
            value: 'bar',
          },
        },
        InterfaceStateStruct,
      ),
    ).not.toThrow();
  });
});
