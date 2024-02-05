import type { PermissionConstraint } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';

import { createGenericPermissionValidator } from './generic';

const MOCK_PERMISSION: PermissionConstraint = {
  caveats: null,
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_ORIGIN,
  parentCapability: 'snap_dialog',
};

describe('createGenericPermissionValidator', () => {
  it('fails if required caveats are not specified', () => {
    const validator = createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds },
      { type: SnapCaveatType.RpcOrigin },
    ]);

    expect(() =>
      validator({
        ...MOCK_PERMISSION,
        caveats: [{ type: SnapCaveatType.ChainIds, value: null }],
      }),
    ).toThrow('Expected the following caveats: "chainIds", "rpcOrigin".');
  });

  it('fails if caveats are of the wrong type', () => {
    const validator = createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds },
      { type: SnapCaveatType.RpcOrigin },
    ]);

    expect(() =>
      validator({
        ...MOCK_PERMISSION,
        caveats: [
          { type: SnapCaveatType.KeyringOrigin, value: null },
          { type: SnapCaveatType.SnapIds, value: null },
        ],
      }),
    ).toThrow(
      'Expected the following caveats: "chainIds", "rpcOrigin", received "keyringOrigin", "snapIds".',
    );
  });

  it('fails if too many caveats specified', () => {
    const validator = createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds },
      { type: SnapCaveatType.RpcOrigin },
    ]);

    expect(() =>
      validator({
        ...MOCK_PERMISSION,
        caveats: [
          { type: SnapCaveatType.ChainIds, value: null },
          { type: SnapCaveatType.ChainIds, value: null },
          { type: SnapCaveatType.RpcOrigin, value: null },
        ],
      }),
    ).toThrow('Duplicate caveats are not allowed.');
  });

  it('does not fail if optional caveat is missing', () => {
    const validator = createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds },
      { type: SnapCaveatType.RpcOrigin, optional: true },
    ]);

    expect(() =>
      validator({
        ...MOCK_PERMISSION,
        caveats: [{ type: SnapCaveatType.ChainIds, value: null }],
      }),
    ).not.toThrow();
  });

  it('does not fail if optional caveats is missing', () => {
    const validator = createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds, optional: true },
      { type: SnapCaveatType.RpcOrigin, optional: true },
    ]);

    expect(() =>
      validator({
        ...MOCK_PERMISSION,
        caveats: [{ type: SnapCaveatType.ChainIds, value: null }],
      }),
    ).not.toThrow();

    expect(() => validator(MOCK_PERMISSION)).not.toThrow();
  });
});
