import { PermissionType } from '@metamask/controllers';
import { longRunningEndowmentBuilder } from './long-running';
import { SnapEndowments } from '.';

describe('endowment:long-running', () => {
  it('builds the expected permission specification', () => {
    const specification = longRunningEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.longRunning,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
