import type { PermissionConstraint } from '@metamask/permission-controller';
import { SnapEndowments } from '@metamask/snaps-rpc-methods';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

export const MOCK_DEVICE_ID = 'hid:11415:4117';

export const MOCK_DEVICE_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.DeviceIds,
      value: { devices: [{ deviceId: MOCK_DEVICE_ID }] },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Devices,
};
