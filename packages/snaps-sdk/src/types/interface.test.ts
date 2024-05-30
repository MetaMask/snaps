import { assert } from '@metamask/superstruct';

import { FormStateStruct, InterfaceStateStruct } from './interface';

describe('FormStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() => assert({ foo: 'bar' }, FormStateStruct)).not.toThrow();
  });
});

describe('InterfaceStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() =>
      assert({ test: { bar: 'baz' }, foo: 'bar' }, InterfaceStateStruct),
    ).not.toThrow();
  });
});
