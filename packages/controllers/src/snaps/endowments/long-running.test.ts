import { PermissionType } from '@metamask/controllers';
import { longRunningEndowmentBuilder } from './long-running';

describe('endowment:long-running', () => {
  it('builds the expected permission specification', () => {
    const specification = longRunningEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: 'endowment:long-running',
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
