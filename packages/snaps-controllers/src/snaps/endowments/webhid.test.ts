import { PermissionType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { webhidEndowmentBuilder } from './webhid';

describe('endowment:webhid', () => {
  it('builds the expected permission specification', () => {
    const specification = webhidEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.WebHID,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toStrictEqual(['navigator']);
  });
});
