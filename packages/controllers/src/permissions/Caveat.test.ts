import * as errors from './errors';
import { CaveatConstraint, decorateWithCaveats } from '.';

// This function is mostly tested through the PermissionController tests,
// we just add a couple here for completeness.
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

    const permission = {
      id: 'foo',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      caveats: [{ type: 'reverse', value: null }] as [CaveatConstraint],
    };

    const decorated = decorateWithCaveats(
      methodImplementation,
      permission,
      caveatSpecifications,
    );

    expect(methodImplementation()).toStrictEqual([1, 2, 3]);
    expect(await decorated({} as any)).toStrictEqual([3, 2, 1]);
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

    const permission = {
      id: 'foo',
      parentCapability: 'arbitraryMethod',
      invoker: 'arbitraryInvoker',
      date: Date.now(),
      // This type doesn't exist
      caveats: [{ type: 'kaplar', value: null }] as [CaveatConstraint],
    };

    expect(() =>
      decorateWithCaveats(
        methodImplementation,
        permission,
        caveatSpecifications,
      )({} as any),
    ).toThrow(new errors.UnrecognizedCaveatTypeError('kaplar'));
  });
});
