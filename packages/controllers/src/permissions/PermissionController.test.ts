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

enum PermissionKeys {
  'wallet_getSecretArray' = 'wallet_getSecretArray',
  'wallet_getSecretObject' = 'wallet_getSecretObject',
  'wallet_getSecret_*' = 'wallet_getSecret_*',
}

const PermissionNames = {
  wallet_getSecretArray: 'wallet_getSecretArray' as const,
  wallet_getSecretObject: 'wallet_getSecretObject' as const,
  wallet_getSecret_: (str: string) => `wallet_getSecret_${str}` as const,
};

function getDefaultPermissionSpecifications(): PermissionSpecifications<
  DefaultTargetKeys,
  DefaultPermissions
> {
  return {
    wallet_getSecretArray: {
      target: PermissionKeys.wallet_getSecretArray,
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return ['secret1', 'secret2', 'secret3'];
      },
    },
    wallet_getSecretObject: {
      target: PermissionKeys.wallet_getSecretObject,
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return { secret1: 'a', secret2: 'b', secret3: 'c' };
      },
    },
    'wallet_getSecret_*': {
      target: PermissionKeys['wallet_getSecret_*'],
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

function getDefaultPermissionControllerWithState() {
  return new PermissionController<
    DefaultTargetKeys,
    DefaultCaveats,
    DefaultPermissions
  >(getControllerOpts({ state: getExistingPermissionState() }));
}

describe('PermissionController', () => {
  describe('constructor', () => {
    it('initializes a new PermissionController', () => {
      const controller = getDefaultPermissionController();
      expect(controller.state).toStrictEqual({ subjects: {} });
      expect(controller.enforcer instanceof PermissionEnforcer).toStrictEqual(
        true,
      );

      expect(controller.unrestrictedMethods).toStrictEqual(
        new Set(getDefaultUnrestrictedMethods()),
      );
    });

    it('rehydrates state', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());
    });
  });

  describe('clearState', () => {
    it("clears the controller's state", () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());

      controller.clearState();
      expect(controller.state).toStrictEqual({ subjects: {} });
    });
  });

  describe('getSubjectNames', () => {
    it('gets all subject names', () => {
      const controller = getDefaultPermissionController();
      expect(controller.getSubjectNames()).toStrictEqual([]);

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(controller.getSubjectNames()).toStrictEqual(['foo']);

      controller.grantPermissions({
        subject: { origin: 'bar' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(controller.getSubjectNames()).toStrictEqual(['foo', 'bar']);
    });
  });

  describe('getPermission', () => {
    it('gets existing permissions', () => {
      const controller = getDefaultPermissionControllerWithState();

      expect(
        controller.getPermission(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(
        getPermissionMatcher(
          PermissionNames.wallet_getSecretArray,
          null,
          'metamask.io',
        ),
      );
    });

    it('returns undefined for non-existing permissions', () => {
      const controller = getDefaultPermissionController();
      expect(
        controller.getPermission(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toBeUndefined();
    });
  });

  describe('hasPermission', () => {
    it('correctly indicates whether an origin has a permission', () => {
      const controller = getDefaultPermissionControllerWithState();

      expect(
        controller.hasPermission(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(true);

      expect(
        controller.hasPermission(
          'metamask.io',
          PermissionNames.wallet_getSecretObject,
        ),
      ).toStrictEqual(false);
    });

    it('correctly indicates whether an origin has a namespaced permission', () => {
      const controller = getDefaultPermissionController();

      controller.grantPermissions({
        subject: { origin: 'metamask.io' },
        approvedPermissions: {
          wallet_getSecret_kabob: {},
        },
      });

      expect(
        controller.hasPermission(
          'metamask.io',
          PermissionNames.wallet_getSecret_('kabob'),
        ),
      ).toStrictEqual(true);

      expect(
        controller.hasPermission(
          'metamask.io',
          PermissionNames.wallet_getSecret_('falafel'),
        ),
      ).toStrictEqual(false);
    });
  });

  describe('hasPermissions', () => {
    it('correctly indicates whether an origin has any permissions', () => {
      const controller = getDefaultPermissionControllerWithState();

      expect(controller.hasPermissions('metamask.io')).toStrictEqual(true);
      expect(controller.hasPermissions('foo.bar')).toStrictEqual(false);
    });
  });

  describe('revokeAllPermissions', () => {
    it('revokes all permissions for the specified subject', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());

      controller.revokeAllPermissions('metamask.io');
      expect(controller.state).toStrictEqual({ subjects: {} });

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecret_('bar')]: {},
        },
      });

      controller.revokeAllPermissions('foo');
      expect(controller.state).toStrictEqual({ subjects: {} });
    });

    it('throws an error if the specified subject has no permissions', () => {
      const controller = getDefaultPermissionController();
      expect(() => controller.revokeAllPermissions('metamask.io')).toThrow(
        new errors.UnrecognizedSubjectError('metamask.io'),
      );

      controller.grantPermissions({
        subject: { origin: 'metamask.io' },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {},
        },
      });

      expect(() => controller.revokeAllPermissions('foo')).toThrow(
        new errors.UnrecognizedSubjectError('foo'),
      );
    });
  });

  describe('revokePermission', () => {
    it('revokes a permission from an origin with a single permission', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());

      controller.revokePermission(
        'metamask.io',
        PermissionNames.wallet_getSecretArray,
      );
      expect(controller.state).toStrictEqual({ subjects: {} });
    });

    it('revokes a permission from an origin with multiple permissions', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {},
        },
      });

      controller.revokePermission(
        origin,
        PermissionNames.wallet_getSecretArray,
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher(
                PermissionNames.wallet_getSecretObject,
                null,
                origin,
              ),
            },
          },
        },
      });
    });

    it('revokes a namespaced permission', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      controller.revokePermission(
        origin,
        PermissionNames.wallet_getSecret_('foo'),
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              [PermissionNames.wallet_getSecretArray]: getPermissionMatcher(
                PermissionNames.wallet_getSecretArray,
                null,
                origin,
              ),
            },
          },
        },
      });
    });

    it('throws an error if the specified subject has no permissions', () => {
      const controller = getDefaultPermissionController();
      expect(() =>
        controller.revokePermission(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toThrow(new errors.UnrecognizedSubjectError('metamask.io'));
    });

    it('throws an error if the requested subject does not have the specified permission', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(() =>
        controller.revokePermission(
          'metamask.io',
          PermissionNames.wallet_getSecretObject,
        ),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          'metamask.io',
          PermissionNames.wallet_getSecretObject,
        ),
      );
    });
  });

  describe('revokePermissions', () => {
    it('revokes different permissions for multiple subjects', () => {
      const controller = getDefaultPermissionController();
      const origin0 = 'origin0';
      const origin1 = 'origin1';
      const origin2 = 'origin2';
      const origin3 = 'origin3';
      const origin4 = 'origin4';

      controller.grantPermissions({
        subject: { origin: origin0 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin1 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin2 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {},
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin3 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin4 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {},
          [PermissionNames.wallet_getSecret_('bar')]: {},
        },
      });

      controller.revokePermissions({
        [origin0]: [PermissionNames.wallet_getSecretArray],
        [origin2]: [
          PermissionNames.wallet_getSecretArray,
          PermissionNames.wallet_getSecret_('foo'),
        ],
        [origin3]: [PermissionNames.wallet_getSecretArray],
        [origin4]: [
          PermissionNames.wallet_getSecretArray,
          PermissionNames.wallet_getSecretObject,
          PermissionNames.wallet_getSecret_('bar'),
        ],
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin1]: {
            origin: origin1,
            permissions: {
              [PermissionNames.wallet_getSecretArray]: getPermissionMatcher(
                PermissionNames.wallet_getSecretArray,
                null,
                origin1,
              ),
            },
          },
          [origin2]: {
            origin: origin2,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher(
                PermissionNames.wallet_getSecretObject,
                null,
                origin2,
              ),
            },
          },
          [origin3]: {
            origin: origin3,
            permissions: {
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher(
                PermissionNames.wallet_getSecret_('foo'),
                [constructCaveat(CaveatTypes.noopCaveat, null)],
                origin3,
              ),
            },
          },
        },
      });
    });

    it('throws an error if a specified subject has no permissions', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(() =>
        controller.revokePermissions({
          foo: [PermissionNames.wallet_getSecretArray],
        }),
      ).toThrow(new errors.UnrecognizedSubjectError('foo'));
    });

    it('throws an error if the requested subject does not have the specified permission', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(() =>
        controller.revokePermissions({
          'metamask.io': [PermissionNames.wallet_getSecretObject],
        }),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          'metamask.io',
          PermissionNames.wallet_getSecretObject,
        ),
      );
    });
  });

  describe('revokePermissionForAllSubjects', () => {
    it('does nothing if there are no subjects', () => {
      const controller = getDefaultPermissionController();
      controller.revokePermissionForAllSubjects(
        PermissionNames.wallet_getSecretArray,
      );
      expect(controller.state).toStrictEqual({ subjects: {} });
    });

    it('revokes single permission from all subjects', () => {
      const controller = getDefaultPermissionController();
      const origin0 = 'origin0';
      const origin1 = 'origin1';
      const origin2 = 'origin2';
      const origin3 = 'origin3';
      const origin4 = 'origin4';

      controller.grantPermissions({
        subject: { origin: origin0 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin1 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin2 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {},
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin3 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: origin4 },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {},
          [PermissionNames.wallet_getSecret_('bar')]: {},
        },
      });

      controller.revokePermissionForAllSubjects(
        PermissionNames.wallet_getSecretArray,
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin0]: {
            origin: origin0,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher(
                PermissionNames.wallet_getSecretObject,
                null,
                origin0,
              ),
            },
          },
          [origin2]: {
            origin: origin2,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher(
                PermissionNames.wallet_getSecretObject,
                null,
                origin2,
              ),
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher(
                PermissionNames.wallet_getSecret_('foo'),
                [constructCaveat(CaveatTypes.noopCaveat, null)],
                origin2,
              ),
            },
          },
          [origin3]: {
            origin: origin3,
            permissions: {
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher(
                PermissionNames.wallet_getSecret_('foo'),
                [constructCaveat(CaveatTypes.noopCaveat, null)],
                origin3,
              ),
            },
          },
          [origin4]: {
            origin: origin4,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher(
                PermissionNames.wallet_getSecretObject,
                null,
                origin4,
              ),
              [PermissionNames.wallet_getSecret_('bar')]: getPermissionMatcher(
                PermissionNames.wallet_getSecret_('bar'),
                [constructCaveat(CaveatTypes.noopCaveat, null)],
                origin4,
              ),
            },
          },
        },
      });
    });
  });

  describe('hasCaveat', () => {
    it.todo('hasCaveat');
  });

  describe('addCaveat', () => {
    it.todo('addCaveat');
  });

  describe('getCaveat', () => {
    it.todo('getCaveat');
  });

  describe('updateCaveat', () => {
    it.todo('updateCaveat');
  });

  describe('removeCaveat', () => {
    it.todo('removeCaveat');
  });

  describe('getRestrictedMethod', () => {
    it.todo('getRestrictedMethod');
    // This is currently disallowed by the types, but handled by getTargetKey
    // Should we add runtime validation forbidding it? Maybe in the constructor?
    it.todo('handles methods ending in "_"');
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

    it('preserves existing permissions if shouldPreserveExistingPermissions is true', () => {
      const controller = getDefaultPermissionControllerWithState();
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
        // This is the default
        // shouldPreserveExistingPermissions: true,
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

    it('overwrites existing permissions if shouldPreserveExistingPermissions is false', () => {
      const controller = getDefaultPermissionControllerWithState();
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
        shouldPreserveExistingPermissions: false,
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

  describe('actions', () => {
    it.todo('controller actions');
  });
});

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
