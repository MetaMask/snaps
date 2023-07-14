import type {
  PermissionConstraint,
  PermissionSpecificationConstraint,
} from '@metamask/permission-controller';
import {
  caveatMappers,
  restrictedMethodPermissionBuilders,
  selectHooks,
} from '@metamask/rpc-methods';
import type { SnapPermissions } from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';

import {
  endowmentCaveatMappers,
  endowmentPermissionBuilders,
} from './endowments';

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
) =>
  Object.values(restrictedMethodPermissionBuilders).reduce<
    Record<string, PermissionSpecificationConstraint>
  >((specifications, { targetName, specificationBuilder, methodHooks }) => {
    if (!excludedPermissions.includes(targetName)) {
      specifications[targetName] = specificationBuilder({
        // @ts-expect-error The selectHooks type is wonky
        methodHooks: selectHooks<typeof hooks, keyof typeof methodHooks>(
          hooks,
          methodHooks,
        ) as Pick<typeof hooks, keyof typeof methodHooks>,
      });
    }
    return specifications;
  }, {});
