import { caveatMappers, restrictedMethodPermissionBuilders, selectHooks } from '@metamask/rpc-methods';
import { hasProperty } from '@metamask/utils';
import { endowmentCaveatMappers, endowmentPermissionBuilders } from './endowments';
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
 */ export function processSnapPermissions(initialPermissions) {
    return Object.fromEntries(Object.entries(initialPermissions).map(([initialPermission, value])=>{
        if (hasProperty(caveatMappers, initialPermission)) {
            return [
                initialPermission,
                caveatMappers[initialPermission](value)
            ];
        } else if (hasProperty(endowmentCaveatMappers, initialPermission)) {
            return [
                initialPermission,
                endowmentCaveatMappers[initialPermission](value)
            ];
        }
        // If we have no mapping, this may be a non-snap permission, return as-is
        return [
            initialPermission,
            value
        ];
    }));
}
export const buildSnapEndowmentSpecifications = (excludedEndowments)=>Object.values(endowmentPermissionBuilders).reduce((allSpecifications, { targetName, specificationBuilder })=>{
        if (!excludedEndowments.includes(targetName)) {
            allSpecifications[targetName] = specificationBuilder({});
        }
        return allSpecifications;
    }, {});
export const buildSnapRestrictedMethodSpecifications = (excludedPermissions, hooks)=>Object.values(restrictedMethodPermissionBuilders).reduce((specifications, { targetName, specificationBuilder, methodHooks })=>{
        if (!excludedPermissions.includes(targetName)) {
            specifications[targetName] = specificationBuilder({
                // @ts-expect-error The selectHooks type is wonky
                methodHooks: selectHooks(hooks, methodHooks)
            });
        }
        return specifications;
    }, {});

//# sourceMappingURL=permissions.js.map