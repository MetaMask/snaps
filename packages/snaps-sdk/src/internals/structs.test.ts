import {
  create,
  defaulted,
  is,
  object,
  string,
  validate,
  any,
} from '@metamask/superstruct';

import {
  enumValue,
  literal,
  typedUnion,
  union,
  nonEmptyRecord,
} from './structs';
import type { BoxElement } from '../jsx';
import { Footer, Icon, Text, Button, Box } from '../jsx';
import {
  BoxStruct,
  FieldStruct,
  FooterStruct,
  TextStruct,
} from '../jsx/validation';

describe('enumValue', () => {
  it('validates an enum value', () => {
    enum Foo {
      Bar = 'bar',
      Baz = 'baz',
    }

    const struct = enumValue(Foo.Bar);

    expect(is('bar', struct)).toBe(true);
    expect(is('baz', struct)).toBe(false);
    expect(is(Foo.Bar, struct)).toBe(true);
    expect(is(Foo.Baz, struct)).toBe(false);
  });
});

describe('literal', () => {
  it.each(['foo', 42, true, false])('validates a literal value', (value) => {
    expect(is(value, literal(value))).toBe(true);
  });

  it('returns a struct with the correct name', () => {
    const [singleError] = validate('foo', literal('bar'));
    expect(singleError?.message).toBe(
      'Expected the literal `"bar"`, but received: "foo"',
    );

    const [unionError] = validate(
      'foo',
      union([literal('bar'), literal('baz')]),
    );
    expect(unionError?.message).toBe(
      'Expected the value to satisfy a union of `"bar" | "baz"`, but received: "foo"',
    );
  });
});

describe('typedUnion', () => {
  const unionStruct = typedUnion([BoxStruct, TextStruct, FieldStruct]);
  const nestedUnionStruct = typedUnion([
    BoxStruct,
    typedUnion([TextStruct, FieldStruct]),
  ]);

  it('validates strictly the part of the union that matches the type', () => {
    // @ts-expect-error Invalid props.
    const result = validate(Text({}), unionStruct);

    expect(result[0]?.message).toBe(
      'At path: props.children -- Expected type to be one of: "Bold", "Italic", "Link", "Icon", "Skeleton", but received: undefined',
    );
  });

  it('validates nested unions', () => {
    // @ts-expect-error Invalid props.
    const result = validate(Text({}), nestedUnionStruct);

    expect(result[0]?.message).toBe(
      'At path: props.children -- Expected type to be one of: "Bold", "Italic", "Link", "Icon", "Skeleton", but received: undefined',
    );
  });

  it('validates refined elements', () => {
    const refinedUnionStruct = typedUnion([BoxStruct, FooterStruct]);
    const result = validate(
      Footer({ children: Button({ children: Icon({ name: 'wallet' }) }) }),
      refinedUnionStruct,
    );

    expect(result[0]?.message).toBe(
      'At path: props.children -- Footer buttons may only contain text.',
    );
  });

  it('supports coercion', () => {
    const coercedStruct = typedUnion([
      BoxStruct,
      defaulted(object({ type: literal('Custom'), key: string() }), {
        type: 'Custom',
        key: 'foo',
      }),
    ]);

    const result = create({ type: 'Custom' }, coercedStruct);
    expect(result.key).toBe('foo');

    const result2 = create(
      Box({ children: Text({ children: 'foo' }) }),
      coercedStruct,
    ) as BoxElement;
    expect(result2.props.children).toStrictEqual({
      type: 'Text',
      key: null,
      props: { children: 'foo' },
    });

    expect(() => create(Button({ children: 'foo' }), coercedStruct)).toThrow(
      'Expected type to be one of: "Box", "Custom", but received: "Button"',
    );
    expect(() => create('foo', coercedStruct)).toThrow(
      'Expected type to be one of: "Box", "Custom", but received: undefined',
    );
  });

  it('returns an error if the value has no type', () => {
    const result = validate({}, unionStruct);

    expect(result[0]?.message).toBe(
      'Expected type to be one of: "Box", "Text", "Field", but received: undefined',
    );
  });

  it('returns an error if the type doesnt exist in the union', () => {
    const result = validate({ type: 'foo' }, unionStruct);

    expect(result[0]?.message).toBe(
      'Expected type to be one of: "Box", "Text", "Field", but received: "foo"',
    );
  });

  it('contains structs as part of the schema', () => {
    expect(unionStruct.schema).toStrictEqual([
      BoxStruct,
      TextStruct,
      FieldStruct,
    ]);
  });
});

describe('nonEmptyRecord', () => {
  it.each([
    { foo: 'bar' },
    {
      a: {
        b: 'c',
      },
    },
  ])('validates "%p"', (value) => {
    const struct = nonEmptyRecord(string(), any());

    expect(is(value, struct)).toBe(true);
  });

  it.each(['foo', 42, null, undefined, [], {}, [1, 2, 3]])(
    'does not validate "%p"',
    (value) => {
      const struct = nonEmptyRecord(string(), any());

      expect(is(value, struct)).toBe(false);
    },
  );
});
