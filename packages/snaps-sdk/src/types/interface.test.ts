import { assert } from '@metamask/superstruct';

import {
  ComponentOrElementStruct,
  FormStateStruct,
  InterfaceStateStruct,
} from './interface';
import { Text } from '../jsx';
import { text } from '../ui';

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

describe('ComponentOrElementStruct', () => {
  it('validates JSX components', () => {
    expect(() =>
      assert(Text({ children: 'foo' }), ComponentOrElementStruct),
    ).not.toThrow();
  });

  it('validates legacy components', () => {
    expect(() => assert(text('foo'), ComponentOrElementStruct)).not.toThrow();
  });
});
