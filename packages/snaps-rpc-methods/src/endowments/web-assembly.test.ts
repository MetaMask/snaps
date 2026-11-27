import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { webAssemblyEndowmentBuilder } from './web-assembly';

describe('endowment:webassembly', () => {
  it('builds the expected permission specification', () => {
    const specification = webAssemblyEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.WebAssemblyAccess,
      globals: ['WebAssembly'],
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });
  });
});
