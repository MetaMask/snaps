import assert from 'assert';
import {
  ControllerMessenger,
  Json,
  AddApprovalRequest,
  AcceptRequest as AcceptApprovalRequest,
  RejectRequest as RejectApprovalRequest,
  HasApprovalRequest,
} from '@metamask/controllers';
import { hasProperty, isPlainObject } from '../utils';
import * as errors from './errors';
import { constructCaveat } from './Caveat';
import {
  AsyncRestrictedMethod,
  CaveatBase,
  constructPermission,
  GenericCaveat,
  GenericPermission,
  MethodNames,
  PermissionConstraint,
  PermissionController,
  PermissionControllerActions,
  PermissionControllerEvents,
  PermissionOptions,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
  PermissionSpecificationBase,
  PermissionSpecificationsMap,
  CaveatSpecificationsMap,
  CaveatSpecificationBase,
} from '.';

// CaveatBase types and specifications

const CaveatTypes = {
  filterArrayResponse: 'filterArrayResponse',
  reverseArrayResponse: 'reverseArrayResponse',
  filterObjectResponse: 'filterObjectResponse',
  noopCaveat: 'noopCaveat',
} as const;

type FilterArrayCaveat = CaveatBase<
  typeof CaveatTypes.filterArrayResponse,
  string[]
>;

type ReverseArrayCaveat = CaveatBase<
  typeof CaveatTypes.reverseArrayResponse,
  null
>;

type FilterObjectCaveat = CaveatBase<
  typeof CaveatTypes.filterObjectResponse,
  string[]
>;

type NoopCaveat = CaveatBase<typeof CaveatTypes.noopCaveat, null>;

// type DefaultCaveats =
//   | FilterArrayCaveat
//   | ReverseArrayCaveat
//   | FilterObjectCaveat
//   | NoopCaveat;

/**
 * Gets caveat specifications for:
 * - {@link FilterArrayCaveat}
 * - {@link FilterObjectCaveat}
 * - {@link NoopCaveat}
 *
 * Used as a default in {@link getPermissionControllerOptions}.
 *
 * @returns The caveat specifications.
 */
function getDefaultCaveatSpecifications() {
  return {
    filterArrayResponse: {
      type: CaveatTypes.filterArrayResponse,
      decorator:
        (
          method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
          caveat: FilterArrayCaveat,
        ) =>
        async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
          const result: string[] | unknown = await method(args);
          if (!Array.isArray(result)) {
            throw Error('not an array');
          }

          return result.filter((resultValue) =>
            caveat.value.includes(resultValue),
          );
        },
    },
    reverseArrayResponse: {
      type: CaveatTypes.reverseArrayResponse,
      decorator:
        (
          method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
          _caveat: ReverseArrayCaveat,
        ) =>
        async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
          const result: unknown[] | unknown = await method(args);
          if (!Array.isArray(result)) {
            throw Error('not an array');
          }

          return result.reverse();
        },
    },
    filterObjectResponse: {
      type: CaveatTypes.filterObjectResponse,
      decorator:
        (
          method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
          caveat: FilterObjectCaveat,
        ) =>
        async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
          const result = await method(args);
          if (!isPlainObject(result)) {
            throw Error('not a plain object');
          }

          Object.keys(result).forEach((key) => {
            if (!caveat.value.includes(key)) {
              delete result[key];
            }
          });
          return result;
        },
    },
    noopCaveat: {
      type: CaveatTypes.noopCaveat,
      decorator:
        (
          method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
          _caveat: NoopCaveat,
        ) =>
        async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
          return method(args);
        },
      validator: (caveat: {
        type: typeof CaveatTypes.noopCaveat;
        value: unknown;
      }) => {
        if (caveat.value !== null) {
          throw new Error('NoopCaveat value must be null');
        }
      },
    },
  } as const;
}

type GetCaveatSpecMapValues<T> = T extends CaveatSpecificationsMap<
  CaveatSpecificationBase<string>
>
  ? T[keyof T]
  : never;

type DefaultCaveatSpecifications = GetCaveatSpecMapValues<
  ReturnType<typeof getDefaultCaveatSpecifications>
>;

// Permission types and specifications

// wallet_getSecret_*
// We only define types for this permission because it's the only one with a
// factory.
// Other permission types are extracted from the permission specifications.

type SecretNamespacedPermissionKey = 'wallet_getSecret_*';

type SecretNamespacedPermission = PermissionConstraint<
  SecretNamespacedPermissionKey,
  NoopCaveat
>;

/**
 * Permission key constants.
 */
const PermissionKeys = {
  wallet_getSecretArray: 'wallet_getSecretArray',
  wallet_getSecretObject: 'wallet_getSecretObject',
  'wallet_getSecret_*': 'wallet_getSecret_*',
} as const;

/**
 * Permission name (as opposed to keys) constants and getters. Since one of the
 * permissions are namespaced, it's a getter function.
 */
const PermissionNames = {
  wallet_getSecretArray: PermissionKeys.wallet_getSecretArray,
  wallet_getSecretObject: PermissionKeys.wallet_getSecretObject,
  wallet_getSecret_: (str: string) => `wallet_getSecret_${str}` as const,
} as const;

/**
 * Gets permission specifications for:
 * - {@link SecretArrayPermission}
 *   - Has neither validator nor factory.
 * - {@link SecretObjectPermission}
 *   - Has validator, but no factory.
 * - {@link SecretNamespacedPermission}
 *   - Has both validator and factory.
 *
 *
 * Used as a default in {@link getPermissionControllerOptions}.
 *
 * @returns The permission specifications.
 */
function getDefaultPermissionSpecifications() {
  return {
    [PermissionKeys.wallet_getSecretArray]: {
      targetKey: PermissionKeys.wallet_getSecretArray,
      allowedCaveats: [
        CaveatTypes.filterArrayResponse,
        CaveatTypes.reverseArrayResponse,
      ],
      methodImplementation: (_args: RestrictedMethodOptions<never>) => {
        return ['a', 'b', 'c'];
        // return () => undefined;
      },
    },
    [PermissionKeys.wallet_getSecretObject]: {
      targetKey: PermissionKeys.wallet_getSecretObject,
      allowedCaveats: [
        CaveatTypes.filterObjectResponse,
        CaveatTypes.noopCaveat,
      ],
      methodImplementation: (_args: RestrictedMethodOptions<never>) => {
        return { a: 'x', b: 'y', c: 'z' };
        // return () => undefined;
      },
      validator: (permission: GenericPermission) => {
        // A dummy validator for a caveat type that should be impossible to add
        assert.ok(
          !permission.caveats?.some(
            (caveat) => caveat.type === CaveatTypes.filterArrayResponse,
          ),
          'getSecretObject permission validation failed',
        );
      },
    },
    [PermissionKeys['wallet_getSecret_*']]: {
      targetKey: PermissionKeys['wallet_getSecret_*'],
      allowedCaveats: [CaveatTypes.noopCaveat],
      methodImplementation: (args: RestrictedMethodOptions<[]>) => {
        return `Hello, secret friend "${args.method.replace(
          'wallet_getSecret_',
          '',
        )}"!`;
        // return Symbol('foo')
      },
      factory: (options: PermissionOptions<SecretNamespacedPermission>) =>
        constructPermission<SecretNamespacedPermission>({
          ...options,
          caveats: [constructCaveat(CaveatTypes.noopCaveat, null)],
        }) as SecretNamespacedPermission,
      validator: (permission: GenericPermission) => {
        assert.deepStrictEqual(
          permission.caveats,
          [constructCaveat(CaveatTypes.noopCaveat, null)],
          'getSecret_* permission validation failed',
        );
      },
    },
  } as const;
}

// TODO:delete
// type DoesExtend<T, U> = T extends U ? T : never;

// const specs = getDefaultPermissionSpecifications()
// type func = typeof specs['wallet_getSecret_*']['methodImplementation']
// type x = DoesExtend<func, GenericRestrictedMethod>
// type xx = DoesExtend<func, (args: RestrictedMethodOptions<RestrictedMethodParameters>) => Json | Promise<Json>>;
// type xxx = DoesExtend<func, (args: any) => Json | Promise<Json>>;
// type xxxx = DoesExtend<func, (args: {
//   method: string;
//   params?: Json;
//   context: RestrictedMethodContext;
// }) => Json | Promise<Json>>;

type GetSpecMapValues<T> = T extends PermissionSpecificationsMap<
  PermissionSpecificationBase<string>
>
  ? T[keyof T]
  : never;

type DefaultPermissionSpecifications = GetSpecMapValues<
  ReturnType<typeof getDefaultPermissionSpecifications>
>;

// The permissions controller

const controllerName = 'PermissionController' as const;

type ApprovalActions =
  | HasApprovalRequest
  | AddApprovalRequest
  | AcceptApprovalRequest
  | RejectApprovalRequest;

/** *
 * Gets a restricted controller messenger.
 *
 * Used as a default in {@link getPermissionControllerOptions}.
 *
 * @returns The restricted messenger.
 */
function getDefaultRestrictedMessenger() {
  const controllerMessenger = new ControllerMessenger<
    PermissionControllerActions | ApprovalActions,
    PermissionControllerEvents
  >();
  return controllerMessenger.getRestricted<
    typeof controllerName,
    PermissionControllerActions['type'] | ApprovalActions['type'],
    PermissionControllerEvents['type']
  >({
    name: controllerName,
    allowedActions: [
      'PermissionController:clearPermissions',
      'PermissionController:getSubjectNames',
      'PermissionController:hasPermissions',
      'ApprovalController:hasRequest',
      'ApprovalController:addRequest',
      'ApprovalController:acceptRequest',
      'ApprovalController:rejectRequest',
    ],
  });
}

/**
 * Gets the default unrestricted methods array.
 *
 * Used as a default in {@link getPermissionControllerOptions}.
 */
function getDefaultUnrestrictedMethods() {
  return ['wallet_unrestrictedMethod'];
}

/**
 * Gets some existing state to populate the permission controller with.
 * There is one subject, "metamask.io", with one permission,
 * "wallet_getSecretArray", with no caveats.
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

/**
 * Gets constructor options for the permission controller. Returns defaults
 * that can be overwritten by passing in replacement options.
 *
 * The following defaults are used:
 * - `caveatSpecifications`: {@link getDefaultCaveatSpecifications}
 * - `messenger`: {@link getDefaultRestrictedMessenger}
 * - `permissionSpecifications`: {@link getDefaultPermissionSpecifications}
 * - `unrestrictedMethods`: {@link getDefaultUnrestrictedMethods}
 * - `state`: `undefined`
 *
 * @param opts - Permission controller options.
 * @returns - The permission controller constructor options.
 */
function getPermissionControllerOptions(opts?: Record<string, unknown>) {
  return {
    caveatSpecifications: getDefaultCaveatSpecifications(),
    messenger: getDefaultRestrictedMessenger(),
    permissionSpecifications: getDefaultPermissionSpecifications(),
    unrestrictedMethods: getDefaultUnrestrictedMethods(),
    state: undefined,
    ...opts,
  };
}

/**
 * Gets a "default" permission controller. This simply means a controller using
 * the default caveat and permissions created in this test file.
 *
 * For the options used, see {@link getPermissionControllerOptions}.
 *
 * @returns The default permission controller for testing.
 */
function getDefaultPermissionController(
  opts = getPermissionControllerOptions(),
) {
  return new PermissionController<
    DefaultPermissionSpecifications,
    DefaultCaveatSpecifications
  >(opts);
  // return new PermissionController(opts);
}

/**
 * Gets an equivalent controller to the one returned by
 * {@link getDefaultPermissionController}, except it's initialized with the
 * state returned by {@link getExistingPermissionState}.
 *
 * @returns The default permission controller for testing, with some initial
 * state.
 */
function getDefaultPermissionControllerWithState() {
  return new PermissionController<
    DefaultPermissionSpecifications,
    DefaultCaveatSpecifications
  >(getPermissionControllerOptions({ state: getExistingPermissionState() }));
}

/**
 * Gets a Jest matcher for a permission as they are stored in controller state.
 *
 * @param parentCapability - The `parentCapability` of the permission.
 * @param caveats - The caveat array of the permission, or `null`.
 * @param invoker - The subject identifier (i.e. origin) of the subject.
 * @returns A Jest matcher that matches permissions whose corresponding fields
 * correspond to the parameters of this function.
 */
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

describe('PermissionController', () => {
  describe('constructor', () => {
    it('initializes a new PermissionController', () => {
      const controller = getDefaultPermissionController();
      expect(controller.state).toStrictEqual({ subjects: {} });

      expect(controller.unrestrictedMethods).toStrictEqual(
        new Set(getDefaultUnrestrictedMethods()),
      );
    });

    it('rehydrates state', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(controller.state).toStrictEqual(getExistingPermissionState());
    });

    it('throws an error for invalid permission target keys', () => {
      expect(
        () =>
          new PermissionController<
            DefaultPermissionSpecifications,
            DefaultCaveatSpecifications
          >(
            getPermissionControllerOptions({
              permissionSpecifications: {
                ...getDefaultPermissionSpecifications(),
                '': { targetKey: '' },
              } as any,
            }),
          ),
      ).toThrow(`Invalid permission target key: ""`);

      expect(
        () =>
          new PermissionController<
            DefaultPermissionSpecifications,
            DefaultCaveatSpecifications
          >(
            getPermissionControllerOptions({
              permissionSpecifications: {
                ...getDefaultPermissionSpecifications(),
                foo_: { targetKey: 'foo_' },
              } as any,
            }),
          ),
      ).toThrow(`Invalid permission target key: "foo_"`);

      expect(
        () =>
          new PermissionController<
            DefaultPermissionSpecifications,
            DefaultCaveatSpecifications
          >(
            getPermissionControllerOptions({
              permissionSpecifications: {
                ...getDefaultPermissionSpecifications(),
                'foo*': { targetKey: 'foo*' },
              } as any,
            }),
          ),
      ).toThrow(`Invalid permission target key: "foo*"`);

      expect(
        () =>
          new PermissionController<
            DefaultPermissionSpecifications,
            DefaultCaveatSpecifications
          >(
            getPermissionControllerOptions({
              permissionSpecifications: {
                ...getDefaultPermissionSpecifications(),
                foo: { targetKey: 'bar' },
              } as any,
            }),
          ),
      ).toThrow(
        `Invalid permission specification: key "foo" must match specification.target value "bar".`,
      );
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

  describe('getRestrictedMethod', () => {
    it('gets the implementation of a restricted method', () => {
      const controller = getDefaultPermissionController();
      expect(
        controller.getRestrictedMethod(PermissionNames.wallet_getSecretArray),
      ).toStrictEqual(
        controller.permissionSpecifications[
          PermissionKeys.wallet_getSecretArray
        ].methodImplementation,
      );
    });

    it('gets the implementation of a namespaced restricted method', () => {
      const controller = getDefaultPermissionController();
      expect(
        controller.getRestrictedMethod(
          PermissionNames.wallet_getSecret_('foo'),
        ),
      ).toStrictEqual(
        controller.permissionSpecifications[
          PermissionKeys['wallet_getSecret_*']
        ].methodImplementation,
      );
    });

    it('returns undefined if the method does not exist', () => {
      const controller = getDefaultPermissionController();
      expect(controller.getRestrictedMethod('foo' as any)).toBeUndefined();
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

  describe('getPermissions', () => {
    it('gets existing permissions', () => {
      const controller = getDefaultPermissionControllerWithState();

      expect(controller.getPermissions('metamask.io')).toStrictEqual({
        [PermissionNames.wallet_getSecretArray]: getPermissionMatcher(
          PermissionNames.wallet_getSecretArray,
          null,
          'metamask.io',
        ),
      });
    });

    it('returns undefined for subjects without permissions', () => {
      const controller = getDefaultPermissionController();
      expect(controller.getPermissions('metamask.io')).toBeUndefined();
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
    it('indicates whether a permission has a particular caveat', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['kaplar']),
            ],
          },
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      expect(
        controller.hasCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      ).toStrictEqual(false);

      expect(
        controller.hasCaveat(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.filterObjectResponse,
        ),
      ).toStrictEqual(true);

      expect(
        controller.hasCaveat(
          origin,
          PermissionNames.wallet_getSecret_('foo'),
          CaveatTypes.noopCaveat,
        ),
      ).toStrictEqual(true);
    });

    it('throws an error if no corresponding permission exists', () => {
      const controller = getDefaultPermissionController();
      expect(() =>
        controller.hasCaveat(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });
  });

  describe('getCaveat', () => {
    it('gets existing caveats', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['kaplar']),
            ],
          },
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      expect(
        controller.getCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      ).toBeUndefined();

      expect(
        controller.getCaveat(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.filterObjectResponse,
        ),
      ).toStrictEqual(
        constructCaveat(CaveatTypes.filterObjectResponse, ['kaplar']),
      );

      expect(
        controller.getCaveat(
          origin,
          PermissionNames.wallet_getSecret_('foo'),
          CaveatTypes.noopCaveat,
        ),
      ).toStrictEqual(constructCaveat(CaveatTypes.noopCaveat, null));
    });

    it('throws an error if no corresponding permission exists', () => {
      const controller = getDefaultPermissionController();
      expect(() =>
        controller.getCaveat(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });
  });

  describe('addCaveat', () => {
    it('adds a caveat to the specified permission', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      controller.addCaveat(
        origin,
        PermissionNames.wallet_getSecretArray,
        CaveatTypes.filterArrayResponse,
        ['foo'],
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
                [constructCaveat(CaveatTypes.filterArrayResponse, ['foo'])],
                origin,
              ),
            },
          },
        },
      });
    });

    it(`appends a caveat to the specified permission's existing caveats`, () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['foo']),
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
                [constructCaveat(CaveatTypes.filterObjectResponse, ['foo'])],
                origin,
              ),
            },
          },
        },
      });

      controller.addCaveat(
        origin,
        PermissionNames.wallet_getSecretObject,
        CaveatTypes.noopCaveat,
        null,
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
                [
                  constructCaveat(CaveatTypes.filterObjectResponse, ['foo']),
                  constructCaveat(CaveatTypes.noopCaveat, null),
                ],
                origin,
              ),
            },
          },
        },
      });
    });

    it('throws an error if a corresponding caveat already exists', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['kaplar']),
            ],
          },
        },
      });

      expect(() =>
        controller.addCaveat(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.filterObjectResponse,
          ['foo'],
        ),
      ).toThrow(
        new errors.CaveatAlreadyExistsError(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.filterObjectResponse,
        ),
      );
    });

    it('throws an error if no corresponding permission exists', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.addCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
          ['foo'],
        ),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws an error if the permission fails to validate with the added caveat', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['foo']),
            ],
          },
        },
      });

      expect(() =>
        controller.addCaveat(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.filterArrayResponse as any,
          ['foo'],
        ),
      ).toThrow(new Error('getSecretObject permission validation failed'));
    });
  });

  describe('updateCaveat', () => {
    it('updates an existing caveat', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [
              constructCaveat(CaveatTypes.filterArrayResponse, ['foo']),
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
                [constructCaveat(CaveatTypes.filterArrayResponse, ['foo'])],
                origin,
              ),
            },
          },
        },
      });

      controller.updateCaveat(
        origin,
        PermissionNames.wallet_getSecretArray,
        CaveatTypes.filterArrayResponse,
        ['bar'],
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
                [constructCaveat(CaveatTypes.filterArrayResponse, ['bar'])],
                origin,
              ),
            },
          },
        },
      });
    });

    it('throws an error if no corresponding permission exists', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.updateCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
          ['foo'],
        ),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws an error if no corresponding caveat exists', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      expect(() =>
        controller.updateCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
          ['foo'],
        ),
      ).toThrow(
        new errors.CaveatDoesNotExistError(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      );
    });

    it('throws an error if the updated caveat fails to validate', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecret_('foo')]: {
            caveats: [constructCaveat(CaveatTypes.noopCaveat, null)],
          },
        },
      });

      expect(() =>
        controller.updateCaveat(
          origin,
          PermissionNames.wallet_getSecret_('foo'),
          CaveatTypes.noopCaveat,
          'bar' as any,
        ),
      ).toThrow(new Error('NoopCaveat value must be null'));
    });
  });

  describe('removeCaveat', () => {
    it('removes an existing caveat', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [
              constructCaveat(CaveatTypes.filterArrayResponse, ['foo']),
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
                [constructCaveat(CaveatTypes.filterArrayResponse, ['foo'])],
                origin,
              ),
            },
          },
        },
      });

      controller.removeCaveat(
        origin,
        PermissionNames.wallet_getSecretArray,
        CaveatTypes.filterArrayResponse,
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher(
                'wallet_getSecretArray',
                null,
                origin,
              ),
            },
          },
        },
      });
    });

    it('removes an existing caveat, without modifying other caveats of the same permission', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.noopCaveat, null),
              constructCaveat(CaveatTypes.filterObjectResponse, ['foo']),
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
                [
                  constructCaveat(CaveatTypes.noopCaveat, null),
                  constructCaveat(CaveatTypes.filterObjectResponse, ['foo']),
                ],
                origin,
              ),
            },
          },
        },
      });

      controller.removeCaveat(
        origin,
        PermissionNames.wallet_getSecretObject,
        CaveatTypes.noopCaveat,
      );

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
                [constructCaveat(CaveatTypes.filterObjectResponse, ['foo'])],
                origin,
              ),
            },
          },
        },
      });
    });

    it('throws an error if no corresponding permission exists', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.removeCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      ).toThrow(
        new errors.PermissionDoesNotExistError(
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws an error if no corresponding caveat exists', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['foo']),
            ],
          },
        },
      });

      expect(() =>
        controller.removeCaveat(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      ).toThrow(
        new errors.CaveatDoesNotExistError(
          origin,
          PermissionNames.wallet_getSecretArray,
          CaveatTypes.filterArrayResponse,
        ),
      );

      expect(() =>
        controller.removeCaveat(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.noopCaveat,
        ),
      ).toThrow(
        new errors.CaveatDoesNotExistError(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.noopCaveat,
        ),
      );
    });

    it('throws an error if the permission fails to validate after caveat removal', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecret_('foo')]: {
            caveats: [constructCaveat(CaveatTypes.noopCaveat, null)],
          },
        },
      });

      expect(() =>
        controller.removeCaveat(
          origin,
          PermissionNames.wallet_getSecret_('foo'),
          CaveatTypes.noopCaveat,
        ),
      ).toThrow(new Error('getSecret_* permission validation failed'));
    });
  });

  describe('grantPermissions', () => {
    it('grants new permission', () => {
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

    it('grants new permissions (multiple at once)', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          wallet_getSecretArray: {},
          wallet_getSecretObject: {
            parentCapability: 'wallet_getSecretObject',
          },
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
              wallet_getSecretObject: getPermissionMatcher(
                'wallet_getSecretObject',
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

    it('preserves existing permissions if preserveExistingPermissions is true', () => {
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
        // preserveExistingPermissions is true by default
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

    it('overwrites existing permissions if preserveExistingPermissions is false', () => {
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
        preserveExistingPermissions: false,
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

    it('throws if an approved permission is malformed', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              // This must match the key
              parentCapability: 'wallet_getSecretObject',
            },
          },
        }),
      ).toThrow(
        new errors.InvalidApprovedPermissionError(
          origin,
          'wallet_getSecretArray',
          { parentCapability: 'wallet_getSecretObject' },
        ),
      );

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              parentCapability: 'wallet_getSecretArray',
            },
            wallet_getSecretObject: {
              // This must match the key
              parentCapability: 'wallet_getSecretArray',
            },
          },
        }),
      ).toThrow(
        new errors.InvalidApprovedPermissionError(
          origin,
          'wallet_getSecretObject',
          { parentCapability: 'wallet_getSecretArray' },
        ),
      );
    });

    it('throws if a requested caveat is not a plain object', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              caveats: [[]] as any,
            },
          },
        }),
      ).toThrow(
        new errors.InvalidCaveatError(
          [],
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              caveats: ['foo'] as any,
            },
          },
        }),
      ).toThrow(
        new errors.InvalidCaveatError(
          [],
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws if a requested caveat has more than two keys', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              caveats: [
                {
                  ...constructCaveat(CaveatTypes.filterArrayResponse, ['foo']),
                  bar: 'bar',
                },
              ] as any,
            },
          },
        }),
      ).toThrow(
        new errors.InvalidCaveatFieldsError(
          {
            ...constructCaveat(CaveatTypes.filterArrayResponse, ['foo']),
            bar: 'bar',
          },
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws if a requested caveat type is not a string', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              caveats: [
                {
                  type: 2,
                  value: ['foo'],
                },
              ] as any,
            },
          },
        }),
      ).toThrow(
        new errors.InvalidCaveatTypeError(
          {
            type: 2,
            value: ['foo'],
          },
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws if a requested caveat type does not exist', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              caveats: [constructCaveat('fooType', 'bar')] as any,
            },
          },
        }),
      ).toThrow(
        new errors.CaveatTypeDoesNotExistError(
          constructCaveat('fooType', 'bar'),
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws if a requested caveat has no value field', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              caveats: [
                {
                  type: CaveatTypes.filterArrayResponse,
                  foo: 'bar',
                },
              ] as any,
            },
          },
        }),
      ).toThrow(
        new errors.CaveatMissingValueError(
          {
            type: CaveatTypes.filterArrayResponse,
            foo: 'bar',
          },
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );
    });

    it('throws if caveat validation fails', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            [PermissionNames.wallet_getSecret_('foo')]: {
              caveats: [
                {
                  type: CaveatTypes.noopCaveat,
                  value: 'bar',
                },
              ] as any,
            },
          },
        }),
      ).toThrow(new Error('NoopCaveat value must be null'));
    });

    it('throws if permission validation fails', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretObject: {
              caveats: [
                {
                  type: CaveatTypes.filterArrayResponse,
                  value: ['bar'],
                },
              ] as any,
            },
          },
        }),
      ).toThrow(new Error('getSecretObject permission validation failed'));
    });
  });

  describe('requestPermissions', () => {
    it('requests a permission', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce((async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: { ...requestData.permissions },
          };
        }) as any);

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(origin, {
          [PermissionNames.wallet_getSecretArray]: {},
        }),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretArray]: getPermissionMatcher(
            PermissionNames.wallet_getSecretArray,
            null,
            origin,
          ),
        },
        { id: expect.any(String), origin },
      ]);

      expect(callActionSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: expect.any(String),
          origin,
          requestData: {
            metadata: { id: expect.any(String), origin },
            permissions: { [PermissionNames.wallet_getSecretArray]: {} },
          },
          type: MethodNames.requestPermissions,
        },
        true,
      );
    });

    it('requests multiple permissions', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce((async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: { ...requestData.permissions },
          };
        }) as any);

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(origin, {
          [PermissionNames.wallet_getSecretArray]: {},
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              constructCaveat(CaveatTypes.filterObjectResponse, ['baz']),
            ],
          },
          [PermissionNames.wallet_getSecret_('foo')]: {},
        }),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretArray]: getPermissionMatcher(
            PermissionNames.wallet_getSecretArray,
            null,
            origin,
          ),
          [PermissionNames.wallet_getSecretObject]: getPermissionMatcher(
            PermissionNames.wallet_getSecretObject,
            [constructCaveat(CaveatTypes.filterObjectResponse, ['baz'])],
            origin,
          ),
          [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher(
            PermissionNames.wallet_getSecret_('foo'),
            [constructCaveat(CaveatTypes.noopCaveat, null)],
            origin,
          ),
        },
        { id: expect.any(String), origin },
      ]);

      expect(callActionSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: expect.any(String),
          origin,
          requestData: {
            metadata: { id: expect.any(String), origin },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {},
              [PermissionNames.wallet_getSecretObject]: {
                caveats: [
                  constructCaveat(CaveatTypes.filterObjectResponse, ['baz']),
                ],
              },
              [PermissionNames.wallet_getSecret_('foo')]: {},
            },
          },
          type: MethodNames.requestPermissions,
        },
        true,
      );
    });

    it('throws if no permissions were approved', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce((async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: {}, // no permissions
          };
        }) as any);

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(origin, {
            [PermissionNames.wallet_getSecretArray]: {},
          }),
      ).rejects.toThrow(
        errors.internalError(
          `Approved permissions request for origin "${origin}" contains no permissions.`,
          {
            [PermissionNames.wallet_getSecretArray]: {},
          },
        ),
      );

      expect(callActionSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: expect.any(String),
          origin,
          requestData: {
            metadata: { id: expect.any(String), origin },
            permissions: { [PermissionNames.wallet_getSecretArray]: {} },
          },
          type: MethodNames.requestPermissions,
        },
        true,
      );
    });

    it('throws if requested permissions are invalid', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      // Iterate over some invalid inputs
      [
        // not plain objects
        null,
        'foo',
        [{ [PermissionNames.wallet_getSecretArray]: {} }],
        // no permissions
        {},
      ].forEach(async (input) => {
        await expect(
          async () => await controller.requestPermissions(origin, input as any),
        ).rejects.toThrow(
          errors.invalidParams({
            data: { origin, requestedPermissions: input },
          }),
        );
      });

      expect(callActionSpy).not.toHaveBeenCalled();
    });

    it('throws if requested permissions contain a (key : value.parentCapability) mismatch', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(origin, {
            [PermissionNames.wallet_getSecretArray]: {
              parentCapability: PermissionNames.wallet_getSecretArray,
            },
            [PermissionNames.wallet_getSecretObject]: {
              parentCapability: PermissionNames.wallet_getSecretArray,
            },
          }),
      ).rejects.toThrow(
        errors.invalidParams({
          data: {
            origin,
            requestedPermissions: {
              [PermissionNames.wallet_getSecretArray]: {
                [PermissionNames.wallet_getSecretArray]: {
                  parentCapability: PermissionNames.wallet_getSecretArray,
                },
                [PermissionNames.wallet_getSecretObject]: {
                  parentCapability: PermissionNames.wallet_getSecretArray,
                },
              },
            },
          },
        }),
      );

      expect(callActionSpy).not.toHaveBeenCalled();
    });

    it('throws if requesting a permission for an unre target', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(origin, {
            [PermissionNames.wallet_getSecretArray]: {},
            wallet_getSecretKabob: {},
          }),
      ).rejects.toThrow(
        errors.methodNotFound({
          method: 'wallet_getSecretKabob',
          data: {
            origin,
            requestedPermissions: {
              [PermissionNames.wallet_getSecretArray]: {
                [PermissionNames.wallet_getSecretArray]: {},
                wallet_getSecretKabob: {},
              },
            },
          },
        }),
      );

      expect(callActionSpy).not.toHaveBeenCalled();
    });
  });

  describe('acceptPermissionsRequest', () => {
    it('accepts a permissions request', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const id = 'foobar';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce((async (..._args: any) => true) as any)
        .mockImplementationOnce((async (..._args: any) => undefined) as any);

      const controller = getDefaultPermissionController(options);

      await controller.acceptPermissionsRequest({
        metadata: { id, origin },
        permissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      expect(callActionSpy).toHaveBeenCalledTimes(2);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ApprovalController:hasRequest',
        {
          id,
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:acceptRequest',
        id,
        {
          metadata: { id, origin },
          permissions: {
            [PermissionNames.wallet_getSecretArray]: {},
          },
        },
      );
    });

    it('rejects the request if it contains no permissions', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const id = 'foobar';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(((..._args: any) => true) as any)
        .mockImplementationOnce(((..._args: any) => undefined) as any);

      const controller = getDefaultPermissionController(options);

      await controller.acceptPermissionsRequest({
        metadata: { id, origin },
        permissions: {},
      });

      expect(callActionSpy).toHaveBeenCalledTimes(2);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ApprovalController:hasRequest',
        {
          id,
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:rejectRequest',
        id,
        errors.invalidParams({
          message: 'Must request at least one permission.',
        }),
      );
    });

    it('throws if the request does not exist', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const id = 'foobar';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(((..._args: any) => false) as any);

      const controller = getDefaultPermissionController(options);

      await expect(
        async () =>
          await controller.acceptPermissionsRequest({
            metadata: { id, origin },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          }),
      ).rejects.toThrow(new errors.PermissionsRequestNotFoundError(id));

      expect(callActionSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ApprovalController:hasRequest',
        {
          id,
        },
      );
    });

    it('rejects the request and throws if accepting the request throws', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const id = 'foobar';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(((..._args: any) => true) as any)
        .mockImplementationOnce(((..._args: any) => {
          throw new Error('unexpected failure');
        }) as any)
        .mockImplementationOnce(((..._args: any) => undefined) as any);

      const controller = getDefaultPermissionController(options);

      await expect(
        async () =>
          await controller.acceptPermissionsRequest({
            metadata: { id, origin },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          }),
      ).rejects.toThrow(new Error('unexpected failure'));

      expect(callActionSpy).toHaveBeenCalledTimes(3);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ApprovalController:hasRequest',
        {
          id,
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:acceptRequest',
        id,
        {
          metadata: { id, origin },
          permissions: {
            [PermissionNames.wallet_getSecretArray]: {},
          },
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        3,
        'ApprovalController:rejectRequest',
        id,
        new Error('unexpected failure'),
      );
    });
  });

  describe('rejectPermissionsRequest', () => {
    it('rejects a permissions request', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const id = 'foobar';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce((async (..._args: any) => true) as any)
        .mockImplementationOnce((async (..._args: any) => undefined) as any);

      const controller = getDefaultPermissionController(options);

      await controller.rejectPermissionsRequest(id);

      expect(callActionSpy).toHaveBeenCalledTimes(2);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ApprovalController:hasRequest',
        {
          id,
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:rejectRequest',
        id,
        errors.userRejectedRequest(),
      );
    });

    it('throws if the request does not exist', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const id = 'foobar';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(((..._args: any) => false) as any);

      const controller = getDefaultPermissionController(options);

      await expect(
        async () => await controller.rejectPermissionsRequest(id),
      ).rejects.toThrow(new errors.PermissionsRequestNotFoundError(id));

      expect(callActionSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ApprovalController:hasRequest',
        {
          id,
        },
      );
    });
  });

  describe('executeRestrictedMethod', () => {
    it('executes a restricted method', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      expect(
        await controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(['a', 'b', 'c']);
    });

    it('executes a namespaced restricted method', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecret_('foo')]: {},
        },
      });

      expect(
        await controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_getSecret_('foo'),
        ),
      ).toStrictEqual('Hello, secret friend "foo"!');
    });

    it('executes a restricted method with caveats', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [constructCaveat(CaveatTypes.filterArrayResponse, ['b'])],
          },
        },
      });

      expect(
        await controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(['b']);
    });

    it('executes a restricted method with multiple caveats', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [
              constructCaveat(CaveatTypes.filterArrayResponse, ['a', 'c']),
              constructCaveat(CaveatTypes.reverseArrayResponse, null),
            ],
          },
        },
      });

      expect(
        await controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(['c', 'a']);
    });
  });

  describe('controller actions', () => {
    it('permissionController:clearPermissions', () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);
      const clearStateSpy = jest.spyOn(controller, 'clearState');

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(hasProperty(controller.state.subjects, 'foo')).toStrictEqual(true);

      messenger.call('PermissionController:clearPermissions');
      expect(clearStateSpy).toHaveBeenCalledTimes(1);
      expect(controller.state).toStrictEqual({ subjects: {} });
    });

    it('permissionController:getSubjectNames', () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);
      const getSubjectNamesSpy = jest.spyOn(controller, 'getSubjectNames');

      expect(
        messenger.call('PermissionController:getSubjectNames'),
      ).toStrictEqual([]);

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(
        messenger.call('PermissionController:getSubjectNames'),
      ).toStrictEqual(['foo']);
      expect(getSubjectNamesSpy).toHaveBeenCalledTimes(2);
    });

    it('permissionController:hasPermissions', () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);
      const hasPermissionsSpy = jest.spyOn(controller, 'hasPermissions');

      expect(
        messenger.call('PermissionController:hasPermissions', 'foo'),
      ).toStrictEqual(false);

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(
        messenger.call('PermissionController:hasPermissions', 'foo'),
      ).toStrictEqual(true);
      expect(hasPermissionsSpy).toHaveBeenCalledTimes(2);
      expect(hasPermissionsSpy).toHaveBeenNthCalledWith(1, 'foo');
      expect(hasPermissionsSpy).toHaveBeenNthCalledWith(2, 'foo');
    });
  });
});
