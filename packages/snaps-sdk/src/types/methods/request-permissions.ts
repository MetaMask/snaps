import type { Json } from '@metamask/utils';

import type {
  InitialPermissions,
  PermissionConstraint,
  SubjectPermissions,
} from '../permissions';

/**
 * The request parameters for the `snap_requestPermissions` method.
 *
 */
export type RequestPermissionsParams = InitialPermissions;

/**
 * The result returned by the `snap_requestPermissions` method.
 *
 */
export type RequestPermissionsResult = [
  SubjectPermissions<PermissionConstraint>,
  { data?: Record<string, Json>; id: string; origin: string },
];
