import { form, input, panel, text } from '@metamask/snaps-sdk';

import {
  assertNameIsUnique,
  constructFormInputState,
  constructInputState,
  constructState,
} from './utils';

describe('constructInputState', () => {
  it('returns null if the input has no previous value', () => {
    const component = input('bar');

    const result = constructInputState({}, component);

    expect(result).toBeNull();
  });

  it('returns the previous state value of an input', () => {
    const state = { bar: 'foo' };

    const component = input('bar');

    const result = constructInputState(state, component);

    expect(result).toBe('foo');
  });

  it('returns the defined component value if it is set', () => {
    const state = { bar: 'foo' };

    const component = input({ name: 'bar', value: 'baz' });

    const result = constructInputState(state, component);

    expect(result).toBe('baz');
  });
});

describe('constructFormInputState', () => {
  it('returns null if the input has no previous value', () => {
    const component = input('bar');

    const result = constructFormInputState({}, component, 'foo');

    expect(result).toBeNull();
  });

  it('returns the previous state value of an input', () => {
    const state = { baz: { bar: 'foo' } };

    const component = input('bar');

    const result = constructFormInputState(state, component, 'baz');

    expect(result).toBe('foo');
  });

  it('returns the defined component value if it is set', () => {
    const state = { baz: { bar: 'foo' } };

    const component = input({ name: 'bar', value: 'baz' });

    const result = constructFormInputState(state, component, 'baz');

    expect(result).toBe('baz');
  });
});

describe('assertNameIsUnique', () => {
  it('throws an error if a name is not unique', () => {
    const state = { test: 'foo' };

    expect(() => assertNameIsUnique(state, 'test')).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });

  it('passes if there is no duplicate name', () => {
    const state = { test: 'foo' };

    expect(() => assertNameIsUnique(state, 'bar')).not.toThrow();
  });
});

describe('constructState', () => {
  it('can construct a new component state', () => {
    const components = panel([
      text('text'),
      form({ name: 'foo', children: [input({ name: 'bar' })] }),
    ]);

    const result = constructState({}, components);

    expect(result).toStrictEqual({ foo: { bar: null } });
  });

  it('merges two states', () => {
    const state = { foo: { bar: 'test' } };

    const components = panel([
      text('text'),
      form({
        name: 'foo',
        children: [input({ name: 'bar' }), input({ name: 'baz' })],
      }),
    ]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({ foo: { bar: 'test', baz: null } });
  });

  it('deletes unused state', () => {
    const state = { form: { foo: null, bar: 'test' } };

    const components = panel([
      text('text'),
      form({
        name: 'form',
        children: [input({ name: 'bar' }), input({ name: 'baz' })],
      }),
    ]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({ form: { bar: 'test', baz: null } });
  });

  it('handles multiple forms', () => {
    const state = {
      form1: { foo: null, bar: 'test' },
      form2: { foo: 'abc', bar: 'def' },
    };

    const components = panel([
      text('text'),
      form({
        name: 'form1',
        children: [input({ name: 'bar' }), input({ name: 'baz' })],
      }),
      form({
        name: 'form2',
        children: [input({ name: 'bar' }), input({ name: 'baz' })],
      }),
    ]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({
      form1: { bar: 'test', baz: null },
      form2: { bar: 'def', baz: null },
    });
  });

  it('deletes unused form', () => {
    const state = {
      form1: { foo: null, bar: 'test' },
      form2: { foo: 'abc', bar: 'def' },
    };

    const components = panel([
      text('text'),
      form({
        name: 'form1',
        children: [input({ name: 'bar' }), input({ name: 'baz' })],
      }),
    ]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({
      form1: { bar: 'test', baz: null },
    });
  });

  it('handles nesting forms', () => {
    const state = {
      form1: { foo: null, bar: 'test' },
      form2: { foo: 'abc', bar: 'def' },
    };

    const components = panel([
      text('text'),
      panel([
        form({
          name: 'form1',
          children: [input({ name: 'bar' }), input({ name: 'baz' })],
        }),
      ]),
      panel([
        form({
          name: 'form2',
          children: [input({ name: 'bar' }), input({ name: 'baz' })],
        }),
      ]),
    ]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({
      form1: { bar: 'test', baz: null },
      form2: { bar: 'def', baz: null },
    });
  });

  it('handles root level inputs with value', () => {
    const components = panel([input({ name: 'foo', value: 'bar' })]);

    const result = constructState({}, components);

    expect(result).toStrictEqual({
      foo: 'bar',
    });
  });

  it('handles root level inputs without value', () => {
    const components = panel([input({ name: 'foo' })]);

    const result = constructState({}, components);

    expect(result).toStrictEqual({
      foo: null,
    });
  });

  it('deletes unused root level values', () => {
    const components = panel([input({ name: 'foo' })]);

    const result = constructState({ foo: null, bar: null }, components);

    expect(result).toStrictEqual({
      foo: null,
    });
  });

  it('merges root level inputs from old state', () => {
    const state = {
      foo: 'bar',
    };

    const components = panel([input({ name: 'foo' })]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({
      foo: 'bar',
    });
  });

  it('throws if a name is not unique in a form', () => {
    const components = form({
      name: 'test',
      children: [input({ name: 'foo' }), input({ name: 'foo' })],
    });

    expect(() => constructState({}, components)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "foo".`,
    );
  });

  it('throws if a name is not unique at the root', () => {
    const components = panel([
      input({ name: 'test' }),
      input({ name: 'test' }),
    ]);

    expect(() => constructState({}, components)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });

  it('throws if a form has the same name as an input', () => {
    const components = panel([
      input({ name: 'test' }),
      form({
        name: 'test',
        children: [input({ name: 'foo' })],
      }),
    ]);

    expect(() => constructState({}, components)).toThrow(
      `Duplicate component names are not allowed, found multiple instances of: "test".`,
    );
  });
});
