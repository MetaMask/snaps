import { findCaveat } from './Permission';
import { constructPermission, CaveatConstraint, PermissionConstraint } from '.';

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
    const caveats: [CaveatConstraint] = [{ type: 'foo', value: 'bar' }];

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
});

describe('findCaveat', () => {
  it('finds a caveat', () => {
    const permission: PermissionConstraint = {
      id: 'arbitraryId',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: [{ type: 'foo', value: 'bar' }],
    };

    expect(findCaveat(permission, 'foo')).toStrictEqual({
      type: 'foo',
      value: 'bar',
    });
  });

  it('returns undefined if the specified caveat does not exist', () => {
    const permission: PermissionConstraint = {
      id: 'arbitraryId',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: [{ type: 'foo', value: 'bar' }],
    };

    expect(findCaveat(permission, 'doesNotExist')).toBeUndefined();
  });

  it('returns undefined if the permission has no caveats', () => {
    const permission: PermissionConstraint = {
      id: 'arbitraryId',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: null,
    };

    expect(findCaveat(permission, 'doesNotExist')).toBeUndefined();
  });
});
