import assert from 'assert';
import { ControllerMessenger, Json } from '@metamask/controllers';
import { isPlainObject } from '../utils';
import * as errors from './errors';
import { constructCaveat } from './Caveat';
import {
  AsyncRestrictedMethod,
  CaveatConstraint,
  CaveatSpecifications,
  constructPermission,
  GenericCaveat,
  GenericPermission,
  PermissionConstraint,
  PermissionController,
  PermissionControllerActions,
  PermissionControllerEvents,
  PermissionEnforcer,
  PermissionOptions,
  PermissionSpecifications,
  RestrictedMethodArgs,
} from '.';

// CaveatConstraint types and specifications

enum CaveatTypes {
  filterArrayResponse = 'filterArrayResponse',
  filterObjectResponse = 'filterObjectResponse',
  noopCaveat = 'noopCaveat',
}

type FilterArrayCaveat = CaveatConstraint<
  CaveatTypes.filterArrayResponse,
  string[]
>;

type FilterObjectCaveat = CaveatConstraint<
  CaveatTypes.filterObjectResponse,
  string[]
>;

type NoopCaveat = CaveatConstraint<CaveatTypes.noopCaveat, null>;

type DefaultCaveats = FilterArrayCaveat | FilterObjectCaveat | NoopCaveat;

function getDefaultCaveatSpecifications(): CaveatSpecifications<DefaultCaveats> {
  return {
    filterArrayResponse: {
      type: CaveatTypes.filterArrayResponse,
      decorator:
        (
          method: AsyncRestrictedMethod<Json, Json>,
          caveat: FilterArrayCaveat,
        ) =>
        async (args: RestrictedMethodArgs<Json>) => {
          const result: string[] | unknown = await method(args);
          if (!Array.isArray(result)) {
            throw Error('not an array');
          }

          return result.filter(caveat.value.includes);
        },
    },
    filterObjectResponse: {
      type: CaveatTypes.filterObjectResponse,
      decorator:
        (
          method: AsyncRestrictedMethod<Json, Json>,
          caveat: FilterObjectCaveat,
        ) =>
        async (args: RestrictedMethodArgs<Json>) => {
          const result = await method(args);
          if (!isPlainObject(result)) {
            throw Error('not a plain object');
          }

          caveat.value.forEach((key) => {
            delete result[key];
          });
          return result;
        },
    },
    noopCaveat: {
      type: CaveatTypes.noopCaveat,
      decorator:
        (method: AsyncRestrictedMethod<Json, Json>, _caveat: NoopCaveat) =>
        async (args: RestrictedMethodArgs<Json>) => {
          return method(args);
        },
    },
  };
}

// Permission types and specifications

type SecretArrayName = 'wallet_getSecretArray';

type SecretArrayPermission = PermissionConstraint<
  SecretArrayName,
  FilterArrayCaveat
>;

type SecretObjectName = 'wallet_getSecretObject';

type SecretObjectPermission = PermissionConstraint<
  SecretObjectName,
  FilterObjectCaveat
>;

type SecretNamespacedKey = 'wallet_getSecret_*';

type SecretNamespacedPermission = PermissionConstraint<
  SecretNamespacedKey,
  NoopCaveat
>;

type DefaultTargetKeys =
  | SecretArrayName
  | SecretObjectName
  | SecretNamespacedKey;

type DefaultPermissions =
  | SecretArrayPermission
  | SecretObjectPermission
  | SecretNamespacedPermission;

function getDefaultPermissionSpecifications(): PermissionSpecifications<
  DefaultTargetKeys,
  DefaultPermissions
> {
  return {
    wallet_getSecretArray: {
      target: 'wallet_getSecretArray',
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return ['secret1', 'secret2', 'secret3'];
      },
    },
    wallet_getSecretObject: {
      target: 'wallet_getSecretObject',
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return { secret1: 'a', secret2: 'b', secret3: 'c' };
      },
    },
    'wallet_getSecret_*': {
      target: 'wallet_getSecret_*',
      methodImplementation: (args: RestrictedMethodArgs<Json>) => {
        return `Hello, secret friend "${args.method.replace(
          'wallet_getSecret_',
          '',
        )}"!`;
      },
      factory: (options: PermissionOptions) =>
        constructPermission({
          ...options,
          caveats: [constructCaveat(CaveatTypes.noopCaveat, null)],
        }) as SecretNamespacedPermission,
      validator: (permission: GenericPermission) => {
        if (!permission.parentCapability.startsWith('wallet_getSecret_')) {
          throw new Error('invalid parentCapability');
        }

        assert.deepStrictEqual(
          permission.caveats,
          [constructCaveat(CaveatTypes.noopCaveat, null)],
          'invalid caveats',
        );
      },
    },
  };
}

// The permissions controller

const controllerName = 'PermissionController' as const;

function getDefaultRestrictedMessenger() {
  const controllerMessenger = new ControllerMessenger<
    PermissionControllerActions,
    PermissionControllerEvents
  >();
  return controllerMessenger.getRestricted<typeof controllerName, never, never>(
    {
      name: controllerName,
    },
  );
}

function getDefaultUnrestrictedMethods() {
  return ['wallet_unrestrictedMethod'];
}

/**
 * Useful for populating a controller with some existing permissions.
 */
function getExistingPermissionState() {
  return {
    subjects: {
      'metamask.io': {
        origin: 'metamask.io',
        permissions: {
          wallet_getSecretArray: {
            id: 'escwEx9JrOxGZKZk3RkL4',
            parentCapability: 'wallet_getSecretArray',
            invoker: 'metamask.io',
            caveats: null,
            date: 1632618373085,
          },
        },
      },
    },
  };
}

function getControllerOpts(opts?: Record<string, unknown>) {
  return {
    caveatSpecifications: getDefaultCaveatSpecifications(),
    messenger: getDefaultRestrictedMessenger(),
    permissionSpecifications: getDefaultPermissionSpecifications(),
    unrestrictedMethods: getDefaultUnrestrictedMethods(),
    state: undefined,
    ...opts,
  };
}

function getDefaultPermissionController() {
  return new PermissionController<
    DefaultTargetKeys,
    DefaultCaveats,
    DefaultPermissions
  >(getControllerOpts());
}

describe('PermissionController', () => {
  describe('constructor', () => {
    it('initializes a new PermissionController', () => {
      const controller = getDefaultPermissionController();
      expect(controller.state).toStrictEqual({ subjects: {} });
      expect(controller.enforcer instanceof PermissionEnforcer).toStrictEqual(
        true,
      );
    });

    it('rehydrates state', () => {
      const controller = new PermissionController<
        DefaultTargetKeys,
        DefaultCaveats,
        DefaultPermissions
      >(getControllerOpts({ state: getExistingPermissionState() }));
      expect(controller.state).toStrictEqual(getExistingPermissionState());
    });
  });

  describe('grantPermissions', () => {
    it('grants new permissions', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
              ),
            },
          },
        },
      });
    });

    it('grants new permissions (namespaced, with factory and validator)', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          wallet_getSecret_kabob: {},
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecret_kabob: getPermissionMatcher(
                'wallet_getSecret_kabob',
                [constructCaveat(CaveatTypes.noopCaveat, null)],
              ),
            },
          },
        },
      });
    });

    it('grants new permissions (multiple origins)', () => {
      const controller = getDefaultPermissionController();
      const origin1 = 'metamask.io';
      const origin2 = 'infura.io';

      controller.grantPermissions({
        subject: { origin: origin1 },
        approvedPermissions: {
          wallet_getSecret_kabob: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin2 },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin1]: {
            origin: origin1,
            permissions: {
              wallet_getSecret_kabob: getPermissionMatcher(
                'wallet_getSecret_kabob',
                [constructCaveat(CaveatTypes.noopCaveat, null)],
                origin1,
              ),
            },
          },
          [origin2]: {
            origin: origin2,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
                null,
                origin2,
              ),
            },
          },
        },
      });
    });

    it('overwrites existing permissions if shouldPreserveExistingPermissions is false', () => {
      const controller = new PermissionController<
        DefaultTargetKeys,
        DefaultCaveats,
        DefaultPermissions
      >(getControllerOpts({ state: getExistingPermissionState() }));
      const origin = 'metamask.io';

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
              ),
            },
          },
        },
      });

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          wallet_getSecretObject: {},
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: expect.objectContaining({
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
              ),
            }),
          },
        },
      });
    });

    it('preserves existing permissions if shouldPreserveExistingPermissions is true', () => {
      const controller = new PermissionController<
        DefaultTargetKeys,
        DefaultCaveats,
        DefaultPermissions
      >(getControllerOpts({ state: getExistingPermissionState() }));
      const origin = 'metamask.io';

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: expect.objectContaining({
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
              ),
            }),
          },
        },
      });

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          wallet_getSecretObject: {},
        },
        shouldPreserveExistingPermissions: true,
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: expect.objectContaining({
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
              ),
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
              ),
            }),
          },
        },
      });
    });

    it('throws if the origin is invalid', () => {
      const controller = getDefaultPermissionController();

      expect(() =>
        controller.grantPermissions({
          subject: { origin: '' },
          approvedPermissions: {
            wallet_getSecretArray: {},
          },
        }),
      ).toThrow(new errors.InvalidSubjectIdentifierError(''));

      expect(() =>
        controller.grantPermissions({
          subject: { origin: 2 as any },
          approvedPermissions: {
            wallet_getSecretArray: {},
          },
        }),
      ).toThrow(new errors.InvalidSubjectIdentifierError(2));
    });

    it('throws if the target does not exist', () => {
      const controller = getDefaultPermissionController();

      expect(() =>
        controller.grantPermissions({
          subject: { origin: 'metamask.io' },
          approvedPermissions: {
            wallet_getSecretFalafel: {},
          },
        }),
      ).toThrow(errors.methodNotFound({ method: 'wallet_getSecretFalafel' }));
    });
  });
});

// controller.addCaveat(
//   'foo',
//   'wallet_getSecretArray' as const,
//   CaveatTypes.filterArrayResponse,
//   ['foo'],
// );

// Testing utilities

function getPermissionMatcher(
  parentCapability: string,
  caveats: GenericCaveat[] | null | typeof expect.objectContaining = null,
  invoker = 'metamask.io',
) {
  return expect.objectContaining({
    id: expect.any(String),
    parentCapability,
    invoker,
    caveats,
    date: expect.any(Number),
  });
}
