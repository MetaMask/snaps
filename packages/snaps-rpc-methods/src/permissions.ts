import { selectHooks, assertExpectedHooks } from '@metamask/json-rpc-engine/v2';
import {
  createRestrictedMethodMessenger,
  type PermissionConstraint,
  type PermissionSpecificationConstraint,
} from '@metamask/permission-controller';
import type { SnapPermissions } from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';

import {
  endowmentCaveatMappers,
  endowmentPermissionBuilders,
} from './endowments';
import type {
  RestrictedMethodActions,
  RestrictedMethodMessenger,
} from './restricted';
import {
  caveatMappers,
  restrictedMethodPermissionBuilders,
} from './restricted';

/**
 * Map initial permissions as defined in a Snap manifest to something that can
 * be processed by the PermissionsController. Each caveat mapping function
 * should return a valid permission caveat value.
 *
 * This function does not validate the caveat values, since that is done by
 * the PermissionsController itself, upon requesting the permissions.
 *
 * @param initialPermissions - The initial permissions to process.
 * @returns The processed permissions.
 */
export function processSnapPermissions(
  initialPermissions: SnapPermissions,
): Record<string, Pick<PermissionConstraint, 'caveats'>> {
  return Object.fromEntries(
    Object.entries(initialPermissions).map(([initialPermission, value]) => {
      if (hasProperty(caveatMappers, initialPermission)) {
        return [initialPermission, caveatMappers[initialPermission](value)];
      } else if (hasProperty(endowmentCaveatMappers, initialPermission)) {
        return [
          initialPermission,
          endowmentCaveatMappers[initialPermission](value),
        ];
      }

      // If we have no mapping, this may be a non-snap permission, return as-is
      return [
        initialPermission,
        value as Pick<PermissionConstraint, 'caveats'>,
      ];
    }),
  );
}

export const buildSnapEndowmentSpecifications = (
  excludedEndowments: string[],
) =>
  Object.values(endowmentPermissionBuilders).reduce<
    Record<string, PermissionSpecificationConstraint>
  >((allSpecifications, { targetName, specificationBuilder }) => {
    if (!excludedEndowments.includes(targetName)) {
      allSpecifications[targetName] = specificationBuilder({});
    }
    return allSpecifications;
  }, {});

export const buildSnapRestrictedMethodSpecifications = (
  excludedPermissions: string[],
  hooks: Record<string, unknown>,
  messenger: RestrictedMethodMessenger,
) => {
  const permissionBuilders = Object.values(
    restrictedMethodPermissionBuilders,
  ).filter((builder) => !excludedPermissions.includes(builder.targetName));

  const expectedHookNames = new Set(
    permissionBuilders.flatMap((builder) =>
      builder.methodHooks
        ? Object.getOwnPropertyNames(builder.methodHooks)
        : [],
    ),
  );

  assertExpectedHooks(hooks, expectedHookNames);

  return permissionBuilders.reduce<
    Record<string, PermissionSpecificationConstraint>
  >(
    (
      specifications,
      { targetName, specificationBuilder, methodHooks, actionNames },
    ) => {
      specifications[targetName] = specificationBuilder({
        methodHooks: selectHooks(hooks, methodHooks),
        messenger: createRestrictedMethodMessenger({
          namespace: targetName,
          rootMessenger: messenger,
          actionNames: actionNames as readonly [
            RestrictedMethodActions['type'],
          ],
        }),
      });
      return specifications;
    },
    {},
  );
};
