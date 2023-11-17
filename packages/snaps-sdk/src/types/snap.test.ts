import { expectTypeOf } from 'expect-type';

import type { SnapId } from './snap';

describe('SnapId', () => {
  it('is a string', () => {
    expectTypeOf<SnapId>().toMatchTypeOf<string>();
  });

  it('does not allow other strings', () => {
    expectTypeOf<SnapId>().not.toEqualTypeOf<string>();
  });
});
