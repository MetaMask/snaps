import { ControllerMessenger, Json } from '@metamask/controllers';
import {
  AsyncRestrictedMethodImplementation,
  Caveat,
  CaveatDecorator,
  CaveatSpecs,
  PermConstraint,
  PermissionController,
  PermissionControllerActions,
  PermissionControllerEvents,
  PermissionEnforcer,
  PermSpecs,
  RestrictedMethodArgs,
} from '.';

const controllerName = 'PermissionController' as const;

function getRestrictedMessenger() {
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

enum CaveatTypes {
  filterArrayResponse = 'filterArrayResponse',
}

type DefaultTargetNames = 'wallet_getSecretArray';

type DefaultCaveats = Caveat<Json[]>;

type DefaultPermissions = PermConstraint<DefaultTargetNames, DefaultCaveats>;

function getCaveatSpecifications(): CaveatSpecs<DefaultCaveats> {
  return {
    filterArrayResponse: {
      type: CaveatTypes.filterArrayResponse,
      decorator: ((
          method: AsyncRestrictedMethodImplementation<Json, string[]>,
          caveat: { type: CaveatTypes.filterArrayResponse; value: string[] },
        ) =>
        async (args: RestrictedMethodArgs<Json>) => {
          const result = await method(args);
          if (!Array.isArray(result)) {
            throw Error('not an array');
          }

          return result.filter(caveat.value.includes);
        }) as CaveatDecorator<Json[]>,
    },
  };
}

function getPermissionSpecifications(): PermSpecs<
  DefaultPermissions['parentCapability']
> {
  return {
    wallet_getSecretArray: {
      target: 'wallet_getSecretArray',
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return ['secret1', 'secret2', 'secret3'];
      },
    },
  };
}

function getPermissionController(): PermissionController<
  DefaultTargetNames,
  DefaultCaveats,
  DefaultPermissions
> {
  return new PermissionController({
    caveatSpecifications: getCaveatSpecifications(),
    messenger: getRestrictedMessenger(),
    permissionSpecifications: getPermissionSpecifications(),
    unrestrictedMethods: ['wallet_unrestrictedMethod'],
  });
}

describe('PermissionController', () => {
  describe('constructor', () => {
    it('initializes a new PermissionController', () => {
      const controller = getPermissionController();
      expect(controller.state).toStrictEqual({ subjects: {} });
      expect(controller.enforcer instanceof PermissionEnforcer).toStrictEqual(
        true,
      );
    });
  });

  describe('grantPermissions', () => {
    it('grants new permissions', () => {
      const controller = getPermissionController();
      const origin = 'metamask.io';

      controller.grantPermissions({
        subject: { origin },
        approvedPermissions: {
          wallet_getSecretArray: {},
        },
      });

      // controller.addCaveat('foo', 'wallet_getSecretArray', 'filterArrayResponse', ['foo'])

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
  });
});
