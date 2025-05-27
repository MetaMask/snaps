import type { PermissionConstraint } from '@metamask/permission-controller';
import { SnapEndowments } from '@metamask/snaps-rpc-methods';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';

export const MOCK_CRONJOB_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
          {
            expression: '* * * * *',
            request: {
              method: 'exampleMethodOne',
              params: ['p1'],
            },
          },
        ],
      },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_ORIGIN,
  parentCapability: SnapEndowments.Cronjob,
};

type GetCronjobPermissionArgs =
  | {
      expression?: string;
    }
  | {
      duration?: string;
    };

/**
 * Get a cronjob permission object as {@link PermissionConstraint}.
 *
 * @param args - The arguments to use when creating the permission.
 * @returns The permission object.
 */
export function getCronjobPermission(
  args: GetCronjobPermissionArgs = {},
): PermissionConstraint {
  return {
    caveats: [
      {
        type: SnapCaveatType.SnapCronjob,
        value: {
          jobs: [
            {
              ...args,
              request: {
                method: 'exampleMethod',
                params: ['p1'],
              },
            },
          ],
        },
      },
    ],
    date: 1664187844588,
    id: 'izn0WGUO8cvq_jqvLQuQP',
    invoker: MOCK_ORIGIN,
    parentCapability: SnapEndowments.Cronjob,
  };
}
