import type { PermissionConstraint } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';

import { SnapEndowments } from '../snaps/endowments';

export const MOCK_CRONJOB_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
          {
            expression: {
              minute: '*',
              hour: '*',
              dayOfMonth: '*',
              month: '*',
              dayOfWeek: '*',
            },
            request: {
              method: 'exampleMethodOne',
              params: ['p1'],
            },
          },
          {
            expression: '* * * * *',
            request: {
              method: 'exampleMethodTwo',
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

type GetCronjobPermissionArgs = {
  expression?: string;
};

/**
 * Get a cronjob permission object as {@link PermissionConstraint}.
 *
 * @param args - The arguments to use when creating the permission.
 * @param args.expression - The cron expression to use for the permission.
 * @returns The permission object.
 */
export function getCronjobPermission({
  expression = '59 6 * * *',
}: GetCronjobPermissionArgs = {}): PermissionConstraint {
  return {
    caveats: [
      {
        type: SnapCaveatType.SnapCronjob,
        value: {
          jobs: [
            {
              expression,
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
