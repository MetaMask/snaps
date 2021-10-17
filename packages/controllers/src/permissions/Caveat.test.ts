import * as errors from './errors';
import {
  CaveatSpecification,
  CaveatSpecificationMap,
  decorateWithCaveats,
  GenericPermission,
} from '.';

// This function is mostly tested through the PermissionController tests,
// we just add a couple here for completeness.
describe('decorateWithCaveats', () => {
  it('decorates a method with caveat', () => {
    const methodImplementation = () => [1, 2, 3];

    const caveatSpecifications = {
      reverse: {
        decorator: (method: any, _caveat: any) => () =>
          method().reverse() as any,
      },
    } as unknown as CaveatSpecificationMap<CaveatSpecification<string>>;

    const permission = {
      caveats: [{ type: 'reverse', value: null }],
    } as unknown as GenericPermission;

    expect(methodImplementation()).toStrictEqual([1, 2, 3]);
    expect(
      decorateWithCaveats(
        methodImplementation,
        permission,
        caveatSpecifications,
      )({} as any),
    ).toStrictEqual([3, 2, 1]);
  });

  it('throws an error if the caveat type is unrecognized', () => {
    const methodImplementation = () => [1, 2, 3];

    const caveatSpecifications = {
      reverse: {
        decorator: (method: any, _caveat: any) => () =>
          method().reverse() as any,
      },
    } as unknown as CaveatSpecificationMap<CaveatSpecification<string>>;

    const permission = {
      // This type doesn't exist
      caveats: [{ type: 'kaplar', value: null }],
    } as unknown as GenericPermission;

    expect(() =>
      decorateWithCaveats(
        methodImplementation,
        permission,
        caveatSpecifications,
      )({} as any),
    ).toThrow(new errors.UnrecognizedCaveatTypeError('kaplar'));
  });
});
