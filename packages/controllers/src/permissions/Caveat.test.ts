import * as errors from './errors';
import { decorateWithCaveats, PermissionConstraint } from '.';

describe('decorateWithCaveats', () => {
  it('decorates a method with caveat', async () => {
    const methodImplementation = () => [1, 2, 3];

    const caveatSpecifications = {
      reverse: {
        type: 'reverse',
        decorator: (method: any, _caveat: any) => async () => {
          return (await method()).reverse();
        },
      },
    };

    const permission: PermissionConstraint = {
      id: 'foo',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: [{ type: 'reverse', value: null }],
    };

    const decorated = decorateWithCaveats(
      methodImplementation,
      permission,
      caveatSpecifications,
    );

    expect(methodImplementation()).toStrictEqual([1, 2, 3]);
    expect(
      await decorated({
        method: 'arbitraryMethod',
        context: { origin: 'metamask.io' },
      }),
    ).toStrictEqual([3, 2, 1]);
  });

  it('decorates a method with multiple caveats', async () => {
    const methodImplementation = () => [1, 2, 3];

    const caveatSpecifications = {
      reverse: {
        type: 'reverse',
        decorator: (method: any, _caveat: any) => async () => {
          return (await method()).reverse();
        },
      },
      slice: {
        type: 'slice',
        decorator: (method: any, caveat: any) => async () => {
          return (await method()).slice(0, caveat.value);
        },
      },
    };

    const permission: PermissionConstraint = {
      id: 'foo',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: [
        { type: 'reverse', value: null },
        { type: 'slice', value: 1 },
      ],
    };

    const decorated = decorateWithCaveats(
      methodImplementation,
      permission,
      caveatSpecifications,
    );

    expect(methodImplementation()).toStrictEqual([1, 2, 3]);
    expect(
      await decorated({
        method: 'arbitraryMethod',
        context: { origin: 'metamask.io' },
      }),
    ).toStrictEqual([3]);
  });

  it('returns the unmodified method implementation if there are no caveats', () => {
    const methodImplementation = () => [1, 2, 3];

    const permission: PermissionConstraint = {
      id: 'foo',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: null,
    };

    const decorated = decorateWithCaveats(methodImplementation, permission, {});
    expect(methodImplementation()).toStrictEqual(
      decorated({
        method: 'arbitraryMethod',
        context: { origin: 'metamask.io' },
      }),
    );
  });

  it('throws an error if the caveat type is unrecognized', () => {
    const methodImplementation = () => [1, 2, 3];

    const caveatSpecifications = {
      reverse: {
        type: 'reverse',
        decorator: (method: any, _caveat: any) => async () => {
          return (await method()).reverse();
        },
      },
    };

    const permission: PermissionConstraint = {
      id: 'foo',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      // This type doesn't exist
      caveats: [{ type: 'kaplar', value: null }],
    };

    expect(() =>
      decorateWithCaveats(
        methodImplementation,
        permission,
        caveatSpecifications,
      )({
        method: 'arbitraryMethod',
        context: { origin: 'metamask.io' },
      }),
    ).toThrow(new errors.UnrecognizedCaveatTypeError('kaplar'));
  });
});
