import { is } from '@metamask/superstruct';

import { ElementStruct, KeyStruct, StringElementStruct } from './component';

describe('KeyStruct', () => {
  it.each(['foo', 42])('validates a key', (value) => {
    expect(is(value, KeyStruct)).toBe(true);
  });

  it.each([null, undefined, {}, []])('does not validate "%p"', (value) => {
    expect(is(value, KeyStruct)).toBe(false);
  });
});

describe('StringElementStruct', () => {
  it('validates a string value', () => {
    expect(is('foo', StringElementStruct)).toBe(true);
  });

  it('validates an array of string elements', () => {
    expect(is(['foo', 'bar'], StringElementStruct)).toBe(true);
  });

  it.each([undefined, {}])('does not validate "%p"', (value) => {
    expect(is(value, StringElementStruct)).toBe(false);
  });
});

describe('ElementStruct', () => {
  it.each([
    {
      type: 'text',
      props: {
        children: 'foo',
      },
      key: null,
    },
    {
      type: 'box',
      props: {
        children: {
          type: 'text',
          props: {
            children: 'foo',
          },
        },
      },
      key: null,
    },
    {
      type: 'row',
      props: {
        label: 'label',
      },
      key: null,
    },
  ])('validates an element', (value) => {
    expect(is(value, ElementStruct)).toBe(true);
  });

  it.each([
    {
      type: 'text',
      props: {
        children: 'foo',
      },
    },
    {
      type: 'box',
      props: {
        children: {
          type: 'text',
          props: {
            children: 'foo',
          },
        },
      },
    },
    {
      type: 'row',
      props: {
        label: 'label',
      },
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, ElementStruct)).toBe(false);
  });
});
