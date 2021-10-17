import {
  CaveatSpecificationConstraint,
  CaveatSpecificationMap,
} from './Caveat';
import {
  PermissionSpecificationConstraint,
  PermissionSpecificationMap,
} from './Permission';

export enum MethodNames {
  requestPermissions = 'wallet_requestPermissions',
  getPermissions = 'wallet_getPermissions',
}

/**
 * Utility type for extracting a union of all individual caveat or permission
 * specification types from a {@link CaveatSpecificationMap} or
 * {@link PermissionSpecificationMap}.
 *
 * @template SpecificationsMap - The caveat or permission specifications map
 * whose specification type union to extract.
 */
export type ExtractSpecifications<
  SpecificationsMap extends
    | CaveatSpecificationMap<CaveatSpecificationConstraint>
    | PermissionSpecificationMap<PermissionSpecificationConstraint>,
> = SpecificationsMap[keyof SpecificationsMap];
