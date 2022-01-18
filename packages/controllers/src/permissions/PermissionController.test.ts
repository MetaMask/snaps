import assert from 'assert';
import {
  AcceptRequest as AcceptApprovalRequest,
  AddApprovalRequest,
  ControllerMessenger,
  HasApprovalRequest,
  Json,
  RejectRequest as RejectApprovalRequest,
} from '@metamask/controllers';
import { JsonRpcEngine, PendingJsonRpcResponse } from 'json-rpc-engine';
import { hasProperty, isPlainObject } from '../utils';
import * as errors from './errors';
import { EndowmentGetterParams } from './Permission';
import {
  AsyncRestrictedMethod,
  Caveat,
  CaveatConstraint,
  CaveatMutatorOperation,
  constructPermission,
  ExtractSpecifications,
  MethodNames,
  PermissionConstraint,
  PermissionController,
  PermissionControllerActions,
  PermissionControllerEvents,
  PermissionOptions,
  PermissionType,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
  ValidPermission,
} from '.';

// Caveat types and specifications

const CaveatTypes = {
  filterArrayResponse: 'filterArrayResponse',
  reverseArrayResponse: 'reverseArrayResponse',
  filterObjectResponse: 'filterObjectResponse',
  noopCaveat: 'noopCaveat',
} as const;

type FilterArrayCaveat = Caveat<
  typeof CaveatTypes.filterArrayResponse,
  string[]
>;

type ReverseArrayCaveat = Caveat<typeof CaveatTypes.reverseArrayResponse, null>;

type FilterObjectCaveat = Caveat<
  typeof CaveatTypes.filterObjectResponse,
  string[]
>;

type NoopCaveat = Caveat<typeof CaveatTypes.noopCaveat, null>;

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
    [CaveatTypes.filterArrayResponse]: {
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
      validator: (caveat: {
        type: typeof CaveatTypes.filterArrayResponse;
        value: unknown;
      }) => {
        if (!Array.isArray(caveat.value)) {
          throw new Error(
            `${CaveatTypes.filterArrayResponse} values must be arrays`,
          );
        }
      },
    },
    [CaveatTypes.reverseArrayResponse]: {
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
    [CaveatTypes.filterObjectResponse]: {
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
    [CaveatTypes.noopCaveat]: {
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

type DefaultCaveatSpecifications = ExtractSpecifications<
  ReturnType<typeof getDefaultCaveatSpecifications>
>;

// Permission types and specifications

/**
 * Permission key constants.
 */
const PermissionKeys = {
  wallet_doubleNumber: 'wallet_doubleNumber',
  wallet_getSecretArray: 'wallet_getSecretArray',
  wallet_getSecretObject: 'wallet_getSecretObject',
  wallet_noop: 'wallet_noop',
  wallet_noopWithValidator: 'wallet_noopWithValidator',
  wallet_noopWithFactory: 'wallet_noopWithFactory',
  'wallet_getSecret_*': 'wallet_getSecret_*',
  endowmentPermission1: 'endowmentPermission1',
} as const;

// wallet_getSecret_*
// We only define types for permissions with factories.
// Other permission types are extracted from the permission specifications in
// the permission controller.

type SecretNamespacedPermission = ValidPermission<
  typeof PermissionKeys['wallet_getSecret_*'],
  NoopCaveat
>;

type NoopWithFactoryPermission = ValidPermission<
  typeof PermissionKeys['wallet_noopWithFactory'],
  FilterArrayCaveat
>;

/**
 * Permission name (as opposed to keys) constants and getters. Since one of the
 * permissions are namespaced, it's a getter function.
 */
const PermissionNames = {
  wallet_doubleNumber: PermissionKeys.wallet_doubleNumber,
  wallet_getSecretArray: PermissionKeys.wallet_getSecretArray,
  wallet_getSecretObject: PermissionKeys.wallet_getSecretObject,
  wallet_noop: PermissionKeys.wallet_noop,
  wallet_noopWithValidator: PermissionKeys.wallet_noopWithValidator,
  wallet_noopWithFactory: PermissionKeys.wallet_noopWithFactory,
  endowmentPermission1: PermissionKeys.endowmentPermission1,
  wallet_getSecret_: (str: string) => `wallet_getSecret_${str}` as const,
} as const;

/**
 * Gets permission specifications for our test permissions.
 * Used as a default in {@link getPermissionControllerOptions}.
 *
 * @returns The permission specifications.
 */
function getDefaultPermissionSpecifications() {
  return {
    [PermissionKeys.wallet_getSecretArray]: {
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys.wallet_getSecretArray,
      allowedCaveats: [
        CaveatTypes.filterArrayResponse,
        CaveatTypes.reverseArrayResponse,
      ],
      methodImplementation: (_args: RestrictedMethodOptions<void>) => {
        return ['a', 'b', 'c'];
      },
    },
    [PermissionKeys.wallet_getSecretObject]: {
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys.wallet_getSecretObject,
      allowedCaveats: [
        CaveatTypes.filterObjectResponse,
        CaveatTypes.noopCaveat,
      ],
      methodImplementation: (_args: RestrictedMethodOptions<void>) => {
        return { a: 'x', b: 'y', c: 'z' };
      },
      validator: (permission: PermissionConstraint) => {
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
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys['wallet_getSecret_*'],
      allowedCaveats: [CaveatTypes.noopCaveat],
      methodImplementation: (args: RestrictedMethodOptions<void>) => {
        return `Hello, secret friend "${args.method.replace(
          'wallet_getSecret_',
          '',
        )}"!`;
      },
      factory: (options: PermissionOptions<SecretNamespacedPermission>) =>
        constructPermission<SecretNamespacedPermission>({
          ...options,
          caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
        }),
      validator: (permission: PermissionConstraint) => {
        assert.deepStrictEqual(
          permission.caveats,
          [{ type: CaveatTypes.noopCaveat, value: null }],
          'getSecret_* permission validation failed',
        );
      },
    },
    [PermissionKeys.wallet_doubleNumber]: {
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys.wallet_doubleNumber,
      allowedCaveats: null,
      methodImplementation: ({ params }: RestrictedMethodOptions<[number]>) => {
        if (!Array.isArray(params)) {
          throw new Error(
            `Invalid ${PermissionKeys.wallet_doubleNumber} request`,
          );
        }
        return params[0] * 2;
      },
    },
    [PermissionKeys.wallet_noop]: {
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys.wallet_noop,
      allowedCaveats: null,
      methodImplementation: (_args: RestrictedMethodOptions<void>) => {
        return null;
      },
    },
    // This one exists to check some permission validator logic
    [PermissionKeys.wallet_noopWithValidator]: {
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys.wallet_noopWithValidator,
      methodImplementation: (_args: RestrictedMethodOptions<void>) => {
        return null;
      },
      allowedCaveats: [CaveatTypes.noopCaveat, CaveatTypes.filterArrayResponse],
      validator: (permission: PermissionConstraint) => {
        if (
          permission.caveats?.some(
            ({ type }) => type !== CaveatTypes.noopCaveat,
          )
        ) {
          throw new Error('noop permission validation failed');
        }
      },
    },
    // This one exists just to check that permission factories can use the
    // requestData of approved permission requests
    [PermissionKeys.wallet_noopWithFactory]: {
      permissionType: PermissionType.RestrictedMethod,
      targetKey: PermissionKeys.wallet_noopWithFactory,
      methodImplementation: (_args: RestrictedMethodOptions<void>) => {
        return null;
      },
      allowedCaveats: [CaveatTypes.filterArrayResponse],
      factory: (
        options: PermissionOptions<NoopWithFactoryPermission>,
        requestData?: Record<string, unknown>,
      ) => {
        if (!requestData) {
          throw new Error('requestData is required');
        }

        return constructPermission<NoopWithFactoryPermission>({
          ...options,
          caveats: [
            {
              type: CaveatTypes.filterArrayResponse,
              value: requestData.caveatValue as string[],
            },
          ],
        });
      },
    },
    [PermissionKeys.endowmentPermission1]: {
      permissionType: PermissionType.Endowment,
      targetKey: PermissionKeys.endowmentPermission1,
      endowmentGetter: (_options: EndowmentGetterParams) => ['endowment1'],
      allowedCaveats: null,
    },
  } as const;
}

type DefaultPermissionSpecifications = ExtractSpecifications<
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
function getPermissionControllerMessenger() {
  return new ControllerMessenger<
    PermissionControllerActions | ApprovalActions,
    PermissionControllerEvents
  >().getRestricted<
    typeof controllerName,
    PermissionControllerActions['type'] | ApprovalActions['type'],
    PermissionControllerEvents['type']
  >({
    name: controllerName,
    allowedActions: [
      'PermissionController:clearPermissions',
      'PermissionController:getSubjectNames',
      'PermissionController:getEndowments',
      'PermissionController:getPermissions',
      'PermissionController:hasPermission',
      'PermissionController:hasPermissions',
      'PermissionController:revokeAllPermissions',
      'PermissionController:requestPermissions',
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
 * - `messenger`: {@link getPermissionControllerMessenger}
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
    messenger: getPermissionControllerMessenger(),
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
    typeof opts.permissionSpecifications[keyof typeof opts.permissionSpecifications],
    typeof opts.caveatSpecifications[keyof typeof opts.caveatSpecifications]
  >(opts);
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
 * @param options - Options bag.
 * @param options.parentCapability - The `parentCapability` of the permission.
 * @param options.caveats - The caveat array of the permission, or `null`.
 * @param options.invoker - The subject identifier (i.e. origin) of the subject.
 * @returns A Jest matcher that matches permissions whose corresponding fields
 * correspond to the parameters of this function.
 */
function getPermissionMatcher({
  parentCapability,
  caveats = null,
  invoker = 'metamask.io',
}: {
  parentCapability: string;
  caveats?: CaveatConstraint[] | null | typeof expect.objectContaining;
  invoker?: string;
}) {
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

    it('throws if a permission specification permissionType is invalid', () => {
      [null, '', 'kaplar'].forEach((invalidPermissionType) => {
        expect(
          () =>
            new PermissionController<
              DefaultPermissionSpecifications,
              DefaultCaveatSpecifications
            >(
              getPermissionControllerOptions({
                permissionSpecifications: {
                  ...getDefaultPermissionSpecifications(),
                  foo: {
                    permissionType: invalidPermissionType,
                  },
                },
              }),
            ),
        ).toThrow(`Invalid permission type: "${invalidPermissionType}"`);
      });
    });

    it('throws if a permission specification targetKey is invalid', () => {
      ['', 'foo_', 'foo*'].forEach((invalidTargetKey) => {
        expect(
          () =>
            new PermissionController<
              DefaultPermissionSpecifications,
              DefaultCaveatSpecifications
            >(
              getPermissionControllerOptions({
                permissionSpecifications: {
                  ...getDefaultPermissionSpecifications(),
                  [invalidTargetKey]: {
                    permissionType: PermissionType.Endowment,
                    targetKey: invalidTargetKey,
                  },
                },
              }),
            ),
        ).toThrow(`Invalid permission target key: "${invalidTargetKey}"`);
      });
    });

    it('throws if a permission specification map key does not match its "targetKey" value', () => {
      expect(
        () =>
          new PermissionController<
            DefaultPermissionSpecifications,
            DefaultCaveatSpecifications
          >(
            getPermissionControllerOptions({
              permissionSpecifications: {
                ...getDefaultPermissionSpecifications(),
                foo: {
                  permissionType: PermissionType.Endowment,
                  targetKey: 'bar',
                },
              },
            }),
          ),
      ).toThrow(
        `Invalid permission specification: key "foo" must match specification.target value "bar".`,
      );
    });

    it('throws if a permission specification lists unrecognized caveats', () => {
      const permissionSpecifications = getDefaultPermissionSpecifications();
      (
        permissionSpecifications as any
      ).wallet_getSecretArray.allowedCaveats.push('foo');

      expect(
        () =>
          new PermissionController<
            DefaultPermissionSpecifications,
            DefaultCaveatSpecifications
          >(
            getPermissionControllerOptions({
              permissionSpecifications,
            }),
          ),
      ).toThrow(new errors.UnrecognizedCaveatTypeError('foo'));
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
    it('gets the implementation of a restricted method', async () => {
      const controller = getDefaultPermissionController();
      const method = controller.getRestrictedMethod(
        PermissionNames.wallet_getSecretArray,
      );

      expect(
        await method({
          method: 'wallet_getSecretArray',
          context: { origin: 'github.com' },
        }),
      ).toStrictEqual(['a', 'b', 'c']);
    });

    it('gets the implementation of a namespaced restricted method', async () => {
      const controller = getDefaultPermissionController();
      const method = controller.getRestrictedMethod(
        PermissionNames.wallet_getSecret_('foo'),
      );

      expect(
        await method({
          method: 'wallet_getSecret_foo',
          context: { origin: 'github.com' },
        }),
      ).toStrictEqual('Hello, secret friend "foo"!');
    });

    it('throws an error if the requested permission target is not a restricted method', () => {
      const controller = getDefaultPermissionController();
      expect(() =>
        controller.getRestrictedMethod(PermissionNames.endowmentPermission1),
      ).toThrow(errors.methodNotFound(PermissionNames.endowmentPermission1));
    });

    it('throws an error if the method does not exist', () => {
      const controller = getDefaultPermissionController();
      expect(() => controller.getRestrictedMethod('foo')).toThrow(
        errors.methodNotFound('foo'),
      );
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
        getPermissionMatcher({
          parentCapability: PermissionNames.wallet_getSecretArray,
          caveats: null,
          invoker: 'metamask.io',
        }),
      );
    });

    it('returns undefined if the subject does not exist', () => {
      const controller = getDefaultPermissionController();
      expect(
        controller.getPermission(
          'metamask.io',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toBeUndefined();
    });

    it('returns undefined if the subject does not have the specified permission', () => {
      const controller = getDefaultPermissionControllerWithState();
      expect(
        controller.getPermission(
          'metamask.io',
          PermissionNames.wallet_getSecretObject,
        ),
      ).toBeUndefined();
    });
  });

  describe('getPermissions', () => {
    it('gets existing permissions', () => {
      const controller = getDefaultPermissionControllerWithState();

      expect(controller.getPermissions('metamask.io')).toStrictEqual({
        [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
          parentCapability: PermissionNames.wallet_getSecretArray,
          caveats: null,
          invoker: 'metamask.io',
        }),
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
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: null,
                invoker: origin,
              }),
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
              [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretArray,
                caveats: null,
                invoker: origin,
              }),
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
              [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretArray,
                caveats: null,
                invoker: origin1,
              }),
            },
          },
          [origin2]: {
            origin: origin2,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: null,
                invoker: origin2,
              }),
            },
          },
          [origin3]: {
            origin: origin3,
            permissions: {
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecret_('foo'),
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: origin3,
              }),
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
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: null,
                invoker: origin0,
              }),
            },
          },
          [origin2]: {
            origin: origin2,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: null,
                invoker: origin2,
              }),
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecret_('foo'),
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: origin2,
              }),
            },
          },
          [origin3]: {
            origin: origin3,
            permissions: {
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecret_('foo'),
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: origin3,
              }),
            },
          },
          [origin4]: {
            origin: origin4,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: null,
                invoker: origin4,
              }),
              [PermissionNames.wallet_getSecret_('bar')]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecret_('bar'),
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: origin4,
              }),
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
              { type: CaveatTypes.filterObjectResponse, value: ['kaplar'] },
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
              { type: CaveatTypes.filterObjectResponse, value: ['kaplar'] },
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
      ).toStrictEqual({
        type: CaveatTypes.filterObjectResponse,
        value: ['kaplar'],
      });

      expect(
        controller.getCaveat(
          origin,
          PermissionNames.wallet_getSecret_('foo'),
          CaveatTypes.noopCaveat,
        ),
      ).toStrictEqual({ type: CaveatTypes.noopCaveat, value: null });
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                ],
                invoker: origin,
              }),
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
              { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
                caveats: [
                  { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
                ],
                invoker: origin,
              }),
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
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
                caveats: [
                  { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
                  { type: CaveatTypes.noopCaveat, value: null },
                ],
                invoker: origin,
              }),
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
              { type: CaveatTypes.filterObjectResponse, value: ['kaplar'] },
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
              { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
            ],
          },
        },
      });

      expect(() =>
        controller.addCaveat(
          origin,
          PermissionNames.wallet_getSecretObject,
          CaveatTypes.filterArrayResponse,
          ['foo'],
        ),
      ).toThrow(
        new errors.ForbiddenCaveatError(
          CaveatTypes.filterArrayResponse,
          origin,
          PermissionNames.wallet_getSecretObject,
        ),
      );
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
              { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                ],
                invoker: origin,
              }),
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['bar'] },
                ],
                invoker: origin,
              }),
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
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
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
              { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                ],
                invoker: origin,
              }),
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
                caveats: null,
                invoker: origin,
              }),
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
              { type: CaveatTypes.noopCaveat, value: null },
              { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
            ],
          },
        },
      });

      expect(controller.state).toStrictEqual({
        subjects: {
          [origin]: {
            origin,
            permissions: {
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
                caveats: [
                  { type: CaveatTypes.noopCaveat, value: null },
                  { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
                ],
                invoker: origin,
              }),
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
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
                caveats: [
                  { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
                ],
                invoker: origin,
              }),
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
              { type: CaveatTypes.filterObjectResponse, value: ['foo'] },
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
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
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

  describe('updatePermissionsByCaveat', () => {
    enum MultiCaveatOrigins {
      a = 'a.com',
      b = 'b.io',
      c = 'c.biz',
    }

    /**
     * @returns A tuple of a permission controller and an object listing the
     * origins of its subjects. Each subject has at least one permission
     * with caveats.
     */
    const getMultiCaveatController = () => {
      const controller = getDefaultPermissionController();

      controller.grantPermissions({
        subject: { origin: MultiCaveatOrigins.a },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [{ type: CaveatTypes.filterArrayResponse, value: ['a'] }],
          },
        },
      });

      controller.grantPermissions({
        subject: { origin: MultiCaveatOrigins.b },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [
              { type: CaveatTypes.filterArrayResponse, value: ['b'] },
              { type: CaveatTypes.reverseArrayResponse, value: null },
            ],
          },
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [
              { type: CaveatTypes.filterObjectResponse, value: ['b'] },
              { type: CaveatTypes.noopCaveat, value: null },
            ],
          },
          [PermissionNames.wallet_getSecret_('foo')]: {
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
          },
          [PermissionNames.wallet_doubleNumber]: {},
        },
      });

      controller.grantPermissions({
        subject: { origin: MultiCaveatOrigins.c },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretObject]: {
            caveats: [{ type: CaveatTypes.filterObjectResponse, value: ['c'] }],
          },
          [PermissionNames.wallet_getSecret_('bar')]: {
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
          },
        },
      });

      return controller;
    };

    const getMultiCaveatStateMatcher = (
      overrides: Partial<
        Record<MultiCaveatOrigins, ReturnType<typeof getPermissionMatcher>>
      > = {},
    ) => {
      return {
        subjects: {
          [MultiCaveatOrigins.a]: {
            origin: MultiCaveatOrigins.a,
            permissions: {
              [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretArray,
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['a'] },
                ],
                invoker: MultiCaveatOrigins.a,
              }),
              ...overrides[MultiCaveatOrigins.a],
            },
          },

          [MultiCaveatOrigins.b]: {
            origin: MultiCaveatOrigins.b,
            permissions: {
              [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretArray,
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['b'] },
                  { type: CaveatTypes.reverseArrayResponse, value: null },
                ],
                invoker: MultiCaveatOrigins.b,
              }),
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: [
                  { type: CaveatTypes.filterObjectResponse, value: ['b'] },
                  { type: CaveatTypes.noopCaveat, value: null },
                ],
                invoker: MultiCaveatOrigins.b,
              }),
              [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecret_('foo'),
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: MultiCaveatOrigins.b,
              }),
              [PermissionNames.wallet_doubleNumber]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_doubleNumber,
                caveats: null,
                invoker: MultiCaveatOrigins.b,
              }),
              ...overrides[MultiCaveatOrigins.b],
            },
          },

          [MultiCaveatOrigins.c]: {
            origin: MultiCaveatOrigins.c,
            permissions: {
              [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecretObject,
                caveats: [
                  { type: CaveatTypes.filterObjectResponse, value: ['c'] },
                ],
                invoker: MultiCaveatOrigins.c,
              }),
              [PermissionNames.wallet_getSecret_('bar')]: getPermissionMatcher({
                parentCapability: PermissionNames.wallet_getSecret_('bar'),
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: MultiCaveatOrigins.c,
              }),
              ...overrides[MultiCaveatOrigins.c],
            },
          },
        },
      };
    };

    // This is effectively a test of the above test utilities.
    it('multi-caveat controller has expected state', () => {
      const controller = getMultiCaveatController();
      expect(controller.state).toStrictEqual(getMultiCaveatStateMatcher());
    });

    it('does nothing if there are no subjects', () => {
      const controller = getDefaultPermissionController();
      expect(controller.state).toStrictEqual({ subjects: {} });

      // There are no caveats, so this does nothing.
      controller.updatePermissionsByCaveat(
        CaveatTypes.filterArrayResponse,
        () => {
          return {
            operation: CaveatMutatorOperation.updateValue,
            value: ['a', 'b'],
          };
        },
      );
      expect(controller.state).toStrictEqual({ subjects: {} });
    });

    it('does nothing if the mutator returns the "noop" operation', () => {
      const controller = getMultiCaveatController();

      // Although there are caveats, we always return the "noop" operation, and
      // therefore nothing happens.
      controller.updatePermissionsByCaveat(
        CaveatTypes.filterArrayResponse,
        () => {
          return { operation: CaveatMutatorOperation.noop };
        },
      );
      expect(controller.state).toStrictEqual(getMultiCaveatStateMatcher());
    });

    it('updates the value of all caveats of a particular type', () => {
      const controller = getMultiCaveatController();

      controller.updatePermissionsByCaveat(
        CaveatTypes.filterArrayResponse,
        () => {
          return {
            operation: CaveatMutatorOperation.updateValue,
            value: ['a', 'b'],
          };
        },
      );

      expect(controller.state).toStrictEqual(
        getMultiCaveatStateMatcher({
          [MultiCaveatOrigins.a]: {
            [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
              parentCapability: PermissionNames.wallet_getSecretArray,
              caveats: [
                { type: CaveatTypes.filterArrayResponse, value: ['a', 'b'] },
              ],
              invoker: MultiCaveatOrigins.a,
            }),
          },
          [MultiCaveatOrigins.b]: {
            [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
              parentCapability: PermissionNames.wallet_getSecretArray,
              caveats: [
                { type: CaveatTypes.filterArrayResponse, value: ['a', 'b'] },
                { type: CaveatTypes.reverseArrayResponse, value: null },
              ],
              invoker: MultiCaveatOrigins.b,
            }),
          },
        }),
      );
    });

    it('selectively updates the value of all caveats of a particular type', () => {
      const controller = getMultiCaveatController();

      let counter = 0;
      const mutator: any = () => {
        counter += 1;
        return counter === 1
          ? { operation: CaveatMutatorOperation.noop }
          : {
              operation: CaveatMutatorOperation.updateValue,
              value: ['a', 'b'],
            };
      };

      controller.updatePermissionsByCaveat(
        CaveatTypes.filterArrayResponse,
        mutator,
      );

      expect(controller.state).toStrictEqual(
        getMultiCaveatStateMatcher({
          [MultiCaveatOrigins.b]: {
            [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
              parentCapability: PermissionNames.wallet_getSecretArray,
              caveats: [
                { type: CaveatTypes.filterArrayResponse, value: ['a', 'b'] },
                { type: CaveatTypes.reverseArrayResponse, value: null },
              ],
              invoker: MultiCaveatOrigins.b,
            }),
          },
        }),
      );
    });

    it('deletes all caveats of a particular type', () => {
      const controller = getMultiCaveatController();

      controller.updatePermissionsByCaveat(
        CaveatTypes.filterArrayResponse,
        () => {
          return { operation: CaveatMutatorOperation.deleteCaveat };
        },
      );

      expect(controller.state).toStrictEqual(
        getMultiCaveatStateMatcher({
          [MultiCaveatOrigins.a]: {
            [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
              parentCapability: PermissionNames.wallet_getSecretArray,
              caveats: null,
              invoker: MultiCaveatOrigins.a,
            }),
          },
          [MultiCaveatOrigins.b]: {
            [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
              parentCapability: PermissionNames.wallet_getSecretArray,
              caveats: [
                { type: CaveatTypes.reverseArrayResponse, value: null },
              ],
              invoker: MultiCaveatOrigins.b,
            }),
          },
        }),
      );
    });

    it('revokes permissions associated with a caveat', () => {
      const controller = getMultiCaveatController();

      controller.updatePermissionsByCaveat(
        CaveatTypes.filterObjectResponse,
        () => {
          return { operation: CaveatMutatorOperation.revokePermission };
        },
      );

      const matcher = getMultiCaveatStateMatcher();
      delete matcher.subjects[MultiCaveatOrigins.b].permissions[
        PermissionNames.wallet_getSecretObject
      ];

      delete matcher.subjects[MultiCaveatOrigins.c].permissions[
        PermissionNames.wallet_getSecretObject
      ];

      expect(controller.state).toStrictEqual(matcher);
    });

    it('deletes subject if all permissions are revoked', () => {
      const controller = getMultiCaveatController();

      let counter = 0;
      const mutator: any = () => {
        counter += 1;
        return {
          operation:
            counter === 1
              ? CaveatMutatorOperation.revokePermission
              : CaveatMutatorOperation.noop,
        };
      };

      controller.updatePermissionsByCaveat(
        CaveatTypes.filterArrayResponse,
        mutator,
      );

      const matcher = getMultiCaveatStateMatcher();
      delete (matcher.subjects as any)[MultiCaveatOrigins.a];

      expect(controller.state).toStrictEqual(matcher);
    });

    it('throws if caveat validation fails after a value is updated', () => {
      const controller = getMultiCaveatController();

      expect(() =>
        controller.updatePermissionsByCaveat(
          CaveatTypes.filterArrayResponse,
          () => {
            return {
              operation: CaveatMutatorOperation.updateValue,
              value: 'foo',
            };
          },
        ),
      ).toThrow(`${CaveatTypes.filterArrayResponse} values must be arrays`);
    });

    it('throws if permission validation fails after a value is updated', () => {
      const controller = getMultiCaveatController();

      expect(() =>
        controller.updatePermissionsByCaveat(CaveatTypes.noopCaveat, () => {
          return { operation: CaveatMutatorOperation.deleteCaveat };
        }),
      ).toThrow('getSecret_* permission validation failed');
    });

    it('throws if mutator returns unrecognized operation', () => {
      const controller = getMultiCaveatController();

      expect(() =>
        controller.updatePermissionsByCaveat(
          CaveatTypes.filterArrayResponse,
          () => {
            return { operation: 'foobar' } as any;
          },
        ),
      ).toThrow(`Unrecognized mutation result: "foobar"`);
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
              }),
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
              }),
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
              }),
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
              wallet_getSecret_kabob: getPermissionMatcher({
                parentCapability: 'wallet_getSecret_kabob',
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
              }),
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
              wallet_getSecret_kabob: getPermissionMatcher({
                parentCapability: 'wallet_getSecret_kabob',
                caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
                invoker: origin1,
              }),
            },
          },
          [origin2]: {
            origin: origin2,
            permissions: {
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
                caveats: null,
                invoker: origin2,
              }),
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
              }),
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
              }),
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
              }),
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
              wallet_getSecretArray: getPermissionMatcher({
                parentCapability: 'wallet_getSecretArray',
              }),
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
              wallet_getSecretObject: getPermissionMatcher({
                parentCapability: 'wallet_getSecretObject',
              }),
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
      ).toThrow(errors.methodNotFound('wallet_getSecretFalafel'));
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

    it('throws if an approved permission has duplicate caveats', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_getSecretArray: {
              parentCapability: 'wallet_getSecretArray',
              caveats: [
                { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
              ],
            },
          },
        }),
      ).toThrow(
        new errors.DuplicateCaveatError(
          CaveatTypes.filterArrayResponse,
          origin,
          PermissionNames.wallet_getSecretArray,
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
                  ...{ type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                  bar: 'bar',
                },
              ] as any,
            },
          },
        }),
      ).toThrow(
        new errors.InvalidCaveatFieldsError(
          {
            ...{ type: CaveatTypes.filterArrayResponse, value: ['foo'] },
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
              caveats: [{ type: 'fooType', value: 'bar' }],
            },
          },
        }),
      ).toThrow(
        new errors.UnrecognizedCaveatTypeError(
          'fooType',
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

    it('throws if a requested caveat has a value that is not valid JSON', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      const circular: any = { foo: 'bar' };
      circular.circular = circular;

      [{ foo: () => undefined }, circular, { foo: BigInt(10) }].forEach(
        (invalidValue) => {
          expect(() =>
            controller.grantPermissions({
              subject: { origin },
              approvedPermissions: {
                wallet_getSecretArray: {
                  caveats: [
                    {
                      type: CaveatTypes.filterArrayResponse,
                      value: invalidValue,
                    },
                  ],
                },
              },
            }),
          ).toThrow(
            new errors.CaveatInvalidJsonError(
              {
                type: CaveatTypes.filterArrayResponse,
                value: invalidValue,
              },
              origin,
              PermissionNames.wallet_getSecretArray,
            ),
          );
        },
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
              ],
            },
          },
        }),
      ).toThrow(new Error('NoopCaveat value must be null'));
    });

    it('throws if the requested permission specifies disallowed caveats', () => {
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
              ],
            },
          },
        }),
      ).toThrow(
        new errors.ForbiddenCaveatError(
          CaveatTypes.filterArrayResponse,
          origin,
          PermissionNames.wallet_getSecretObject,
        ),
      );
    });

    it('throws if the requested permission specifies caveats, and no caveats are allowed', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            wallet_doubleNumber: {
              caveats: [
                {
                  type: CaveatTypes.filterArrayResponse,
                  value: ['bar'],
                },
              ],
            },
          },
        }),
      ).toThrow(
        new errors.ForbiddenCaveatError(
          CaveatTypes.filterArrayResponse,
          origin,
          PermissionNames.wallet_doubleNumber,
        ),
      );
    });

    it('throws if the permission validator throws', () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      expect(() =>
        controller.grantPermissions({
          subject: { origin },
          approvedPermissions: {
            [PermissionNames.wallet_noopWithValidator]: {
              caveats: [
                { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
              ],
            },
          },
        }),
      ).toThrow(new Error('noop permission validation failed'));
    });
  });

  describe('requestPermissions', () => {
    it('requests a permission', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: { ...requestData.permissions },
          };
        });

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(
          { origin },
          {
            [PermissionNames.wallet_getSecretArray]: {},
          },
        ),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretArray,
            caveats: null,
            invoker: origin,
          }),
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

    it('requests a permission that requires requestData in its factory', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: { ...requestData.permissions },
            caveatValue: ['foo'], // this will be added to the permission
          };
        });

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(
          { origin },
          {
            [PermissionNames.wallet_noopWithFactory]: {},
          },
        ),
      ).toMatchObject([
        {
          [PermissionNames.wallet_noopWithFactory]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_noopWithFactory,
            caveats: [
              { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
            ],
            invoker: origin,
          }),
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
              [PermissionNames.wallet_noopWithFactory]: {},
            },
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
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: { ...requestData.permissions },
          };
        });

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(
          { origin },
          {
            [PermissionNames.wallet_getSecretArray]: {},
            [PermissionNames.wallet_getSecretObject]: {
              caveats: [
                { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
              ],
            },
            [PermissionNames.wallet_getSecret_('foo')]: {},
          },
        ),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretArray,
            caveats: null,
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretObject,
            caveats: [
              { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
            ],
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecret_('foo'),
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
            invoker: origin,
          }),
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
                  { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
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

    it('requests multiple permissions (approved permissions are a strict superset)', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            // wallet_getSecret_foo is added to the request
            permissions: {
              ...requestData.permissions,
              [PermissionNames.wallet_getSecret_('foo')]: {},
            },
          };
        });

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(
          { origin },
          {
            [PermissionNames.wallet_getSecretArray]: {},
            [PermissionNames.wallet_getSecretObject]: {
              caveats: [
                { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
              ],
            },
          },
        ),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretArray,
            caveats: null,
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretObject,
            caveats: [
              { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
            ],
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecret_('foo'),
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
            invoker: origin,
          }),
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
                  { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
                ],
              },
            },
          },
          type: MethodNames.requestPermissions,
        },
        true,
      );
    });

    it('requests multiple permissions (approved permissions are a strict subset)', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          const approvedPermissions = { ...requestData.permissions };
          delete approvedPermissions[PermissionNames.wallet_getSecretArray];

          return {
            metadata: { ...requestData.metadata },
            permissions: approvedPermissions,
          };
        });

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(
          { origin },
          {
            [PermissionNames.wallet_getSecretArray]: {},
            [PermissionNames.wallet_getSecretObject]: {
              caveats: [
                { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
              ],
            },
            [PermissionNames.wallet_getSecret_('foo')]: {},
          },
        ),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretObject,
            caveats: [
              { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
            ],
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecret_('foo'),
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
            invoker: origin,
          }),
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
                  { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
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

    it('requests multiple permissions (an approved permission is modified)', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          const approvedPermissions = { ...requestData.permissions };
          approvedPermissions[PermissionNames.wallet_getSecretObject] = {
            caveats: [
              { type: CaveatTypes.filterObjectResponse, value: ['kaplar'] },
            ],
          };

          return {
            metadata: { ...requestData.metadata },
            permissions: approvedPermissions,
          };
        });

      const controller = getDefaultPermissionController(options);
      expect(
        await controller.requestPermissions(
          { origin },
          {
            [PermissionNames.wallet_getSecretArray]: {},
            [PermissionNames.wallet_getSecretObject]: {
              caveats: [
                { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
              ],
            },
            [PermissionNames.wallet_getSecret_('foo')]: {},
          },
        ),
      ).toMatchObject([
        {
          [PermissionNames.wallet_getSecretArray]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretArray,
            caveats: null,
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecretObject]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecretObject,
            caveats: [
              { type: CaveatTypes.filterObjectResponse, value: ['kaplar'] },
            ],
            invoker: origin,
          }),
          [PermissionNames.wallet_getSecret_('foo')]: getPermissionMatcher({
            parentCapability: PermissionNames.wallet_getSecret_('foo'),
            caveats: [{ type: CaveatTypes.noopCaveat, value: null }],
            invoker: origin,
          }),
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
                  { type: CaveatTypes.filterObjectResponse, value: ['baz'] },
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

    it('throws if requested permissions object is not a plain object', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const controller = getDefaultPermissionController(options);

      const callActionSpy = jest.spyOn(messenger, 'call');

      for (const invalidInput of [
        // not plain objects
        null,
        'foo',
        [{ [PermissionNames.wallet_getSecretArray]: {} }],
      ]) {
        await expect(
          async () =>
            await controller.requestPermissions(
              { origin },
              invalidInput as any,
            ),
        ).rejects.toThrow(
          errors.invalidParams({
            message: `Requested permissions for origin "${origin}" is not a plain object.`,
            data: { origin, requestedPermissions: invalidInput },
          }),
        );
      }

      expect(callActionSpy).not.toHaveBeenCalled();
    });

    it('throws if requested permissions object has no permissions', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          // No permissions in object
          await controller.requestPermissions({ origin }, {}),
      ).rejects.toThrow(
        errors.invalidParams({
          message: `Permissions request for origin "${origin}" contains no permissions.`,
          data: { origin, requestedPermissions: {} },
        }),
      );

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
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {
                parentCapability: PermissionNames.wallet_getSecretArray,
              },
              // parentCapability value does not match key
              [PermissionNames.wallet_getSecretObject]: {
                parentCapability: PermissionNames.wallet_getSecretArray,
              },
            },
          ),
      ).rejects.toThrow(
        errors.invalidParams({
          message: `Permissions request for origin "${origin}" contains invalid requested permission(s).`,
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

    it('throws if requesting a permission for an unknown target', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {},
              wallet_getSecretKabob: {},
            },
          ),
      ).rejects.toThrow(
        errors.methodNotFound('wallet_getSecretKabob', {
          origin,
          requestedPermissions: {
            [PermissionNames.wallet_getSecretArray]: {
              [PermissionNames.wallet_getSecretArray]: {},
              wallet_getSecretKabob: {},
            },
          },
        }),
      );

      expect(callActionSpy).not.toHaveBeenCalled();
    });

    it('throws if the "caveat" property of a requested permission is invalid', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      for (const invalidCaveatsValue of [
        [], // empty array
        undefined,
        'foo',
        2,
        Symbol('bar'),
      ]) {
        await expect(
          async () =>
            await controller.requestPermissions(
              { origin },
              {
                [PermissionNames.wallet_getSecretArray]: {
                  caveats: invalidCaveatsValue as any,
                },
              },
            ),
        ).rejects.toThrow(
          new errors.InvalidCaveatsPropertyError(
            origin,
            PermissionNames.wallet_getSecretArray,
            invalidCaveatsValue,
          ),
        );

        expect(callActionSpy).not.toHaveBeenCalled();
      }
    });

    it('throws if a requested permission has duplicate caveats', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest.spyOn(messenger, 'call');

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {
                caveats: [
                  { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                  { type: CaveatTypes.filterArrayResponse, value: ['foo'] },
                ],
              },
            },
          ),
      ).rejects.toThrow(
        new errors.DuplicateCaveatError(
          CaveatTypes.filterArrayResponse,
          origin,
          PermissionNames.wallet_getSecretArray,
        ),
      );

      expect(callActionSpy).not.toHaveBeenCalled();
    });

    it('throws if the approved request object is invalid', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const controller = getDefaultPermissionController(options);
      const callActionSpy = jest.spyOn(messenger, 'call');

      for (const invalidRequestObject of ['foo', null, { metadata: 'foo' }]) {
        callActionSpy.mockClear();
        callActionSpy.mockImplementationOnce(async () => invalidRequestObject);

        await expect(
          async () =>
            await controller.requestPermissions(
              { origin },
              {
                [PermissionNames.wallet_getSecretArray]: {},
              },
            ),
        ).rejects.toThrow(
          errors.internalError(
            `Approved permissions request for subject "${origin}" is invalid.`,
            { data: { approvedRequest: invalidRequestObject } },
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
      }
    });

    it('throws if the approved request ID changed', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            // different id
            metadata: { ...requestData.metadata, id: 'foo' },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          };
        });

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          ),
      ).rejects.toThrow(
        errors.internalError(
          `Approved permissions request for subject "${origin}" mutated its id.`,
          { originalId: expect.any(String), mutatedId: 'foo' },
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

    it('throws if the approved request origin changed', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            // different origin
            metadata: { ...requestData.metadata, origin: 'foo.com' },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          };
        });

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          ),
      ).rejects.toThrow(
        errors.internalError(
          `Approved permissions request for subject "${origin}" mutated its origin.`,
          { originalOrigin: origin, mutatedOrigin: 'foo' },
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

    it('throws if no permissions were approved', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: {}, // no permissions
          };
        });

      const controller = getDefaultPermissionController(options);
      await expect(
        async () =>
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {},
            },
          ),
      ).rejects.toThrow(
        errors.internalError(
          `Invalid approved permissions request: Permissions request for origin "${origin}" contains no permissions.`,
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

    it('throws if approved permissions object is not a plain object', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const id = 'arbitraryId';
      const controller = getDefaultPermissionController(options);

      const callActionSpy = jest.spyOn(messenger, 'call');

      // The metadata is valid, but the permissions are invalid
      const getInvalidRequestObject = (invalidPermissions: any) => {
        return {
          metadata: { origin, id },
          permissions: invalidPermissions,
        };
      };

      for (const invalidRequestObject of [
        null,
        'foo',
        [{ [PermissionNames.wallet_getSecretArray]: {} }],
      ].map((invalidPermissions) =>
        getInvalidRequestObject(invalidPermissions),
      )) {
        callActionSpy.mockClear();
        callActionSpy.mockImplementationOnce(async () => invalidRequestObject);

        await expect(
          async () =>
            await controller.requestPermissions(
              { origin },
              {
                [PermissionNames.wallet_getSecretArray]: {},
              },
              { id, preserveExistingPermissions: true },
            ),
        ).rejects.toThrow(
          errors.internalError(
            `Invalid approved permissions request: Requested permissions for origin "${origin}" is not a plain object.`,
            { data: { approvedRequest: invalidRequestObject } },
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
      }
    });

    it('throws if approved permissions contain a (key : value.parentCapability) mismatch', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const origin = 'metamask.io';
      const controller = getDefaultPermissionController(options);

      const callActionSpy = jest
        .spyOn(messenger, 'call')
        .mockImplementationOnce(async (...args: any) => {
          const [, { requestData }] = args;
          return {
            metadata: { ...requestData.metadata },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {
                parentCapability: PermissionNames.wallet_getSecretArray,
              },
              // parentCapability value does not match key
              [PermissionNames.wallet_getSecretObject]: {
                parentCapability: PermissionNames.wallet_getSecretArray,
              },
            },
          };
        });

      await expect(
        async () =>
          await controller.requestPermissions(
            { origin },
            {
              [PermissionNames.wallet_getSecretArray]: {
                parentCapability: PermissionNames.wallet_getSecretArray,
              },
            },
          ),
      ).rejects.toThrow(
        errors.invalidParams({
          message: `Invalid approved permissions request: Permissions request for origin "${origin}" contains invalid requested permission(s).`,
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

      expect(callActionSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: expect.any(String),
          origin,
          requestData: {
            metadata: { id: expect.any(String), origin },
            permissions: {
              [PermissionNames.wallet_getSecretArray]: {
                parentCapability: PermissionNames.wallet_getSecretArray,
              },
            },
          },
          type: MethodNames.requestPermissions,
        },
        true,
      );
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
        .mockImplementationOnce((..._args: any) => true)
        .mockImplementationOnce((..._args: any) => undefined);

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
        .mockImplementationOnce((..._args: any) => true)
        .mockImplementationOnce((..._args: any) => undefined);

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
        .mockImplementationOnce((..._args: any) => false);

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
        .mockImplementationOnce((..._args: any) => true)
        .mockImplementationOnce((..._args: any) => {
          throw new Error('unexpected failure');
        })
        .mockImplementationOnce((..._args: any) => undefined);

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
        .mockImplementationOnce(async (..._args: any) => true)
        .mockImplementationOnce(async (..._args: any) => undefined);

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
        .mockImplementationOnce((..._args: any) => false);

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

  describe('getEndowments', () => {
    it('gets the endowments', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.endowmentPermission1]: {},
        },
      });

      expect(
        await controller.getEndowments(
          origin,
          PermissionNames.endowmentPermission1,
        ),
      ).toStrictEqual(['endowment1']);
    });

    it('throws if the requested permission target is not an endowment', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      await expect(
        controller.getEndowments(
          origin,
          PermissionNames.wallet_getSecretArray as any,
        ),
      ).rejects.toThrow(
        new errors.EndowmentPermissionDoesNotExistError(
          PermissionNames.wallet_getSecretArray,
          origin,
        ),
      );
    });

    it('throws if the subject does not have the requisite permission', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      await expect(
        controller.getEndowments(origin, PermissionNames.endowmentPermission1),
      ).rejects.toThrow(
        errors.unauthorized({
          data: { origin, targetName: PermissionNames.endowmentPermission1 },
        }),
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

    it('executes a restricted method with parameters', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_doubleNumber]: {},
        },
      });

      expect(
        await controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_doubleNumber,
          [10],
        ),
      ).toStrictEqual(20);
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

    it('executes a restricted method with a caveat', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [{ type: CaveatTypes.filterArrayResponse, value: ['b'] }],
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
              { type: CaveatTypes.filterArrayResponse, value: ['a', 'c'] },
              { type: CaveatTypes.reverseArrayResponse, value: null },
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

    it('throws if the subject does not have the requisite permission', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      await expect(
        controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_doubleNumber,
        ),
      ).rejects.toThrow(
        errors.unauthorized({
          data: { origin, method: PermissionNames.wallet_doubleNumber },
        }),
      );
    });

    it('throws if the requested method (i.e. target) does not exist', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      await expect(
        controller.executeRestrictedMethod(origin, 'wallet_getMeTacos' as any),
      ).rejects.toThrow(errors.methodNotFound('wallet_getMeTacos', { origin }));
    });

    it('throws if the restricted method returns undefined', async () => {
      const permissionSpecifications = getDefaultPermissionSpecifications();
      (
        permissionSpecifications as any
      ).wallet_doubleNumber.methodImplementation = () => undefined;

      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(
        getPermissionControllerOptions({
          permissionSpecifications,
        }),
      );
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_doubleNumber]: {},
        },
      });

      await expect(
        controller.executeRestrictedMethod(
          origin,
          PermissionNames.wallet_doubleNumber,
        ),
      ).rejects.toThrow(
        new Error(
          `Internal request for method "${PermissionNames.wallet_doubleNumber}" as origin "${origin}" returned no result.`,
        ),
      );
    });
  });

  describe('controller actions', () => {
    it('action: PermissionController:clearPermissions', () => {
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

    it('action: PermissionController:getEndowments', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);
      const getEndowmentsSpy = jest.spyOn(controller, 'getEndowments');

      await expect(
        messenger.call(
          'PermissionController:getEndowments',
          'foo',
          PermissionNames.endowmentPermission1,
        ),
      ).rejects.toThrow(
        errors.unauthorized({
          data: {
            origin: 'foo',
            targetName: PermissionNames.endowmentPermission1,
          },
        }),
      );

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          [PermissionNames.endowmentPermission1]: {},
        },
      });

      expect(
        await messenger.call(
          'PermissionController:getEndowments',
          'foo',
          PermissionNames.endowmentPermission1,
        ),
      ).toStrictEqual(['endowment1']);

      expect(
        await messenger.call(
          'PermissionController:getEndowments',
          'foo',
          PermissionNames.endowmentPermission1,
          { arbitrary: 'requestData' },
        ),
      ).toStrictEqual(['endowment1']);

      expect(getEndowmentsSpy).toHaveBeenCalledTimes(3);
      expect(getEndowmentsSpy).toHaveBeenNthCalledWith(
        1,
        'foo',
        PermissionNames.endowmentPermission1,
        undefined,
      );

      expect(getEndowmentsSpy).toHaveBeenNthCalledWith(
        2,
        'foo',
        PermissionNames.endowmentPermission1,
        undefined,
      );

      expect(getEndowmentsSpy).toHaveBeenNthCalledWith(
        3,
        'foo',
        PermissionNames.endowmentPermission1,
        { arbitrary: 'requestData' },
      );
    });

    it('action: PermissionController:getSubjectNames', () => {
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

    it('action: PermissionController:hasPermission', () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);
      const hasPermissionSpy = jest.spyOn(controller, 'hasPermission');

      expect(
        messenger.call(
          'PermissionController:hasPermission',
          'foo',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(false);

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      expect(
        messenger.call(
          'PermissionController:hasPermission',
          'foo',
          PermissionNames.wallet_getSecretArray,
        ),
      ).toStrictEqual(true);

      expect(
        messenger.call(
          'PermissionController:hasPermission',
          'foo',
          PermissionNames.wallet_getSecretObject,
        ),
      ).toStrictEqual(false);

      expect(hasPermissionSpy).toHaveBeenCalledTimes(3);
      expect(hasPermissionSpy).toHaveBeenNthCalledWith(
        1,
        'foo',
        PermissionNames.wallet_getSecretArray,
      );

      expect(hasPermissionSpy).toHaveBeenNthCalledWith(
        2,
        'foo',
        PermissionNames.wallet_getSecretArray,
      );

      expect(hasPermissionSpy).toHaveBeenNthCalledWith(
        3,
        'foo',
        PermissionNames.wallet_getSecretObject,
      );
    });

    it('action: PermissionController:hasPermissions', () => {
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

    it('action: PermissionController:getPermissions', () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);
      const getPermissionsSpy = jest.spyOn(controller, 'getPermissions');

      expect(
        messenger.call('PermissionController:getPermissions', 'foo'),
      ).toBeUndefined();

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      expect(
        Object.keys(
          messenger.call('PermissionController:getPermissions', 'foo'),
        ),
      ).toStrictEqual(['wallet_getSecretArray']);

      expect(getPermissionsSpy).toHaveBeenCalledTimes(3);
      expect(getPermissionsSpy).toHaveBeenNthCalledWith(1, 'foo');
      expect(getPermissionsSpy).toHaveBeenNthCalledWith(2, 'foo');
    });

    it('action: PermissionController:revokeAllPermissions', () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);

      controller.grantPermissions({
        subject: { origin: 'foo' },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });
      const revokeAllPermissionsSpy = jest.spyOn(
        controller,
        'revokeAllPermissions',
      );

      expect(
        controller.hasPermission('foo', 'wallet_getSecretArray'),
      ).toStrictEqual(true);

      messenger.call('PermissionController:revokeAllPermissions', 'foo');

      expect(
        controller.hasPermission('foo', 'wallet_getSecretArray'),
      ).toStrictEqual(false);
      expect(revokeAllPermissionsSpy).toHaveBeenCalledTimes(1);
      expect(revokeAllPermissionsSpy).toHaveBeenNthCalledWith(1, 'foo');
    });

    it('action: PermissionsController:requestPermissions', async () => {
      const options = getPermissionControllerOptions();
      const { messenger } = options;
      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(options);

      // TODO(ritave): requestPermissions calls unregistered action ApprovalController:addRequest that
      //               can't be easily mocked, thus we mock the whole implementation
      const requestPermissionsSpy = jest
        .spyOn(controller, 'requestPermissions')
        .mockImplementation();

      await messenger.call(
        'PermissionController:requestPermissions',
        { origin: 'foo' },
        {
          wallet_getSecretArray: {},
        },
      );

      expect(requestPermissionsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('permission middleware', () => {
    it('executes a restricted method', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {},
        },
      });

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: PermissionNames.wallet_getSecretArray,
      });

      expect(response.result).toStrictEqual(['a', 'b', 'c']);
    });

    it('executes a restricted method with a caveat', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [{ type: CaveatTypes.filterArrayResponse, value: ['b'] }],
          },
        },
      });

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: PermissionNames.wallet_getSecretArray,
      });

      expect(response.result).toStrictEqual(['b']);
    });

    it('executes a restricted method with multiple caveats', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_getSecretArray]: {
            caveats: [
              { type: CaveatTypes.filterArrayResponse, value: ['a', 'c'] },
              { type: CaveatTypes.reverseArrayResponse, value: null },
            ],
          },
        },
      });

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: PermissionNames.wallet_getSecretArray,
      });

      expect(response.result).toStrictEqual(['c', 'a']);
    });

    it('passes through unrestricted methods', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));
      engine.push(
        (
          _req: any,
          res: PendingJsonRpcResponse<'success'>,
          _next: any,
          end: () => any,
        ) => {
          res.result = 'success';
          end();
        },
      );

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_unrestrictedMethod',
      });

      expect(response.result).toStrictEqual('success');
    });

    it('throws an error if the subject has an invalid "origin" property', async () => {
      const controller = getDefaultPermissionController();

      ['', null, undefined, 2].forEach((invalidOrigin) => {
        expect(() =>
          controller.createPermissionMiddleware({
            origin: invalidOrigin as any,
          }),
        ).toThrow(
          new Error('The subject "origin" must be a non-empty string.'),
        );
      });
    });

    it('returns an error if the subject does not have the requisite permission', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));

      const request: any = {
        jsonrpc: '2.0',
        id: 1,
        method: PermissionNames.wallet_getSecretArray,
      };

      const expectedError = errors.unauthorized({
        data: { origin, method: PermissionNames.wallet_getSecretArray },
      });

      const { error }: any = await engine.handle(request);
      expect(error).toMatchObject(expect.objectContaining(expectedError));
    });

    it('returns an error if the method does not exist', async () => {
      const controller = getDefaultPermissionController();
      const origin = 'metamask.io';

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));

      const request: any = {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_foo',
      };

      const expectedError = errors.methodNotFound('wallet_foo', { origin });

      const { error }: any = await engine.handle(request);
      expect(error).toMatchObject(expect.objectContaining(expectedError));
    });

    it('returns an error if the restricted method returns undefined', async () => {
      const permissionSpecifications = getDefaultPermissionSpecifications();
      (
        permissionSpecifications as any
      ).wallet_doubleNumber.methodImplementation = () => undefined;

      const controller = new PermissionController<
        DefaultPermissionSpecifications,
        DefaultCaveatSpecifications
      >(
        getPermissionControllerOptions({
          permissionSpecifications,
        }),
      );
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          [PermissionNames.wallet_doubleNumber]: {},
        },
      });

      const engine = new JsonRpcEngine();
      engine.push(controller.createPermissionMiddleware({ origin }));

      const request: any = {
        jsonrpc: '2.0',
        id: 1,
        method: PermissionNames.wallet_doubleNumber,
      };

      const expectedError = errors.internalError(
        `Request for method "${PermissionNames.wallet_doubleNumber}" returned undefined result.`,
        { request: { ...request } },
      );

      const { error }: any = await engine.handle(request);
      expect(error).toMatchObject(expect.objectContaining(expectedError));
    });
  });
});
