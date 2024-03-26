import type { BoldProps } from '@metamask/snaps-sdk/jsx';
import { Bold } from '@metamask/snaps-sdk/jsx';
import { expectTypeOf } from 'expect-type';

describe('BoldProps', () => {
  it('accepts children as a string', () => {
    expectTypeOf({ children: 'foo' }).toMatchTypeOf<BoldProps>();
  });

  it('accepts children as an array of strings', () => {
    expectTypeOf({ children: ['foo', 'bar'] }).toMatchTypeOf<BoldProps>();
  });

  it('does not accept children as a number', () => {
    expectTypeOf({ children: 42 }).not.toMatchTypeOf<BoldProps>();
  });
});

describe('Bold', () => {
  it('returns a bold element', () => {
    const result = <Bold>foo</Bold>;

    expect(result).toStrictEqual({
      type: 'bold',
      props: {
        children: 'foo',
      },
      key: null,
    });
  });

  it('returns a bold element with nested children', () => {
    const result = <Bold>foo {'bar'}</Bold>;

    expect(result).toStrictEqual({
      type: 'bold',
      props: {
        children: ['foo ', 'bar'],
      },
      key: null,
    });
  });
});
