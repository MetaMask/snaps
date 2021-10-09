import { CaveatSpecificationBase, CaveatSpecificationsMap } from './Caveat';
import {
  PermissionSpecificationBase,
  PermissionSpecificationsMap,
} from './Permission';

export enum MethodNames {
  requestPermissions = 'wallet_requestPermissions',
  getPermissions = 'wallet_getPermissions',
}

/**
 * Utility type for extracting a union of all individual
 * {@link CaveatSpecificationBase} or
 * {@link PermissionSpecificationBase} types
 * from a {@link CaveatSpecificationsMap} or
 * {@link PermissionSpecificationsMap}.
 *
 * @template SpecificationsMap - The caveat or permission specifications map
 * whose specification type union to extract.
 */
export type ExtractSpecifications<
  SpecificationsMap extends
    | CaveatSpecificationsMap<CaveatSpecificationBase<string>>
    | PermissionSpecificationsMap<PermissionSpecificationBase<string>>,
> = SpecificationsMap[keyof SpecificationsMap];
