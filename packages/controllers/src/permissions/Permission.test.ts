import { constructPermission, CaveatConstraint } from '.';

describe('constructPermission', () => {
  it('constructs a permission', () => {
    const invoker = 'foo.io';
    const target = 'wallet_bar';

    expect(
      constructPermission({
        invoker,
        target,
      }),
    ).toMatchObject(
      expect.objectContaining({
        id: expect.any(String),
        parentCapability: target,
        invoker,
        caveats: null,
        date: expect.any(Number),
      }),
    );
  });

  it('constructs a permission with caveats', () => {
    const invoker = 'foo.io';
    const target = 'wallet_bar';
    const caveats = [{ type: 'foo', value: 'bar' }] as [CaveatConstraint];

    expect(
      constructPermission({
        invoker,
        target,
        caveats,
      }),
    ).toMatchObject(
      expect.objectContaining({
        id: expect.any(String),
        parentCapability: target,
        invoker,
        caveats: [...caveats],
        date: expect.any(Number),
      }),
    );
  });

  it('constructs a permission with an id', () => {
    const invoker = 'foo.io';
    const target = 'wallet_bar';
    const id = 'abc123';

    expect(
      constructPermission({
        invoker,
        target,
        id,
      }),
    ).toMatchObject(
      expect.objectContaining({
        id,
        parentCapability: target,
        invoker,
        caveats: null,
        date: expect.any(Number),
      }),
    );
  });
});
