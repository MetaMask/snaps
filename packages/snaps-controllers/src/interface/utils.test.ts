import { form, input, panel, text } from '@metamask/snaps-sdk';

import { constructState } from './utils';

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
    const state = { foo: { bar: null } };
    const components = panel([
      text('text'),
      form({
        name: 'foo',
        children: [input({ name: 'bar' }), input({ name: 'baz' })],
      }),
    ]);

    const result = constructState(state, components);

    expect(result).toStrictEqual({ foo: { bar: null, baz: null } });
  });
});
