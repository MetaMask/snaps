import { ControllerMessenger, Json } from '@metamask/controllers';
import { isPlainObject } from '../utils';
import * as errors from './errors';
import {
  AsyncRestrictedMethodImplementation,
  Caveat,
  CaveatSpecs,
  PermConstraint,
  PermissionController,
  PermissionControllerActions,
  PermissionControllerEvents,
  PermissionEnforcer,
  PermSpecs,
  RestrictedMethodArgs,
} from '.';

// Caveat types and specifications

enum CaveatTypes {
  filterArrayResponse = 'filterArrayResponse',
  filterObjectResponse = 'filterObjectResponse',
}

type FilterArrayCaveat = Caveat<CaveatTypes.filterArrayResponse, string[]>;
type FilterObjectCaveat = Caveat<CaveatTypes.filterObjectResponse, string[]>;

type DefaultCaveats = FilterArrayCaveat | FilterObjectCaveat;

function getDefaultCaveatSpecifications(): CaveatSpecs<DefaultCaveats> {
  return {
    filterArrayResponse: {
      type: CaveatTypes.filterArrayResponse,
      decorator:
        (
          method: AsyncRestrictedMethodImplementation<Json, Json>,
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
          method: AsyncRestrictedMethodImplementation<Json, Json>,
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
  };
}

// Permission types and specifications

type SecretArrayName = 'wallet_getSecretArray';

type GetSecretArrayPermission = PermConstraint<
  SecretArrayName,
  FilterArrayCaveat
>;

type SecretObjectName = 'wallet_getSecretObject';

type GetSecretObjectPermission = PermConstraint<
  SecretObjectName,
  FilterObjectCaveat
>;

// type DefaultTargetNames = SecretArrayName | SecretObjectName;

type DefaultPermissions = GetSecretArrayPermission | GetSecretObjectPermission;

function getDefaultPermissionSpecifications(): PermSpecs<
  DefaultPermissions['parentCapability']
> {
  return {
    wallet_getSecretArray: {
      target: 'wallet_getSecretArray',
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return ['secret1', 'secret2', 'secret3'];
      },
    },
    wallet_getSecretObject: {
      target: 'wallet_getSecretArray', // TODO:types Same issue as caveat specs
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return ['secret1', 'secret2', 'secret3'];
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

function getDefaultPermissionController(opts = getControllerOpts()) {
  return new PermissionController(opts);
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
              wallet_getSecretArray: {
                id: expect.any(String),
                parentCapability: 'wallet_getSecretArray',
                invoker: origin,
                caveats: null,
                date: expect.any(Number),
              },
            },
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
