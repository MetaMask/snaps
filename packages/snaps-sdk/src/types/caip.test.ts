import { expectTypeOf } from 'expect-type';

import type { AccountId, ChainId } from './caip';

describe('ChainId', () => {
  it('has a colon-separated namespace and reference', () => {
    expectTypeOf<'foo:bar'>().toMatchTypeOf<ChainId>();
  });
});

describe('AccountId', () => {
  it('has a colon-separated chain ID and account address', () => {
    expectTypeOf<'foo:bar:baz'>().toMatchTypeOf<AccountId>();
  });
});
