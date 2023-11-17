import { expectTypeOf } from 'expect-type';

import type { EnumToUnion, Method } from './helpers';

describe('EnumToUnion', () => {
  it('creates a union type from an enum', () => {
    enum Foo {
      Bar = 'bar',
      Baz = 'baz',
    }

    expectTypeOf<EnumToUnion<Foo>>().toEqualTypeOf<'bar' | 'baz'>();
  });

  it('creates a union type from a single enum value', () => {
    enum Foo {
      Bar = 'bar',
      Baz = 'baz',
    }

    expectTypeOf<EnumToUnion<Foo.Bar>>().toEqualTypeOf<'bar'>();
    expectTypeOf<EnumToUnion<Foo.Bar>>().toEqualTypeOf<'bar'>();
  });
});

describe('Method', () => {
  it('creates a JSON-RPC method with the given name and params', () => {
    expectTypeOf<Method<'foo', { foo: string }>>().toEqualTypeOf<{
      method: 'foo';
      params: { foo: string };
    }>();

    expectTypeOf<Method<'foo', [string]>>().toEqualTypeOf<{
      method: 'foo';
      params: [string];
    }>();
  });

  it('creates a JSON-RPC method with the given name and no params', () => {
    expectTypeOf<Method<'bar', never>>().toEqualTypeOf<{
      method: 'bar';
    }>();
  });
});
