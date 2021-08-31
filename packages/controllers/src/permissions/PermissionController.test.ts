import { ControllerMessenger, Json } from '@metamask/controllers';
import {
  AsyncRestrictedMethodImplementation,
  CaveatDecorator,
  CaveatSpecifications,
  PermissionController,
  PermissionControllerActions,
  PermissionControllerEvents,
  PermissionSpecifications,
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

function getCaveatSpecifications(): CaveatSpecifications {
  return {
    filterArrayResponse: {
      type: CaveatTypes.filterArrayResponse,
      decorator: ((
          method: AsyncRestrictedMethodImplementation<Json, string[]>,
          caveat: { type: CaveatTypes.filterArrayResponse; value: string[] },
        ) =>
        async (args: RestrictedMethodArgs<Json>) => {
          const result = await method(args);
          return Array.isArray(result)
            ? result.filter(caveat.value.includes)
            : result;
        }) as CaveatDecorator<Json>,
    },
  };
}

function getPermissionSpecifications(): PermissionSpecifications {
  return {
    wallet_getSecretArray: {
      target: 'wallet_getSecretArray',
      methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
        return ['secret1', 'secret2', 'secret3'];
      },
    },
  };
}

describe('PermissionController', () => {
  describe('constructor', () => {
    it('initializes a new PermissionController', () => {
      const controller = new PermissionController({
        caveatSpecifications: getCaveatSpecifications(),
        messenger: getRestrictedMessenger(),
        permissionSpecifications: getPermissionSpecifications(),
        safeMethods: ['wallet_safeMethod'],
      });

      expect(controller.state).toStrictEqual({ subjects: {} });
    });
  });

  describe('foo', () => {
    it.todo('bar');
  });
});
