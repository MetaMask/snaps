import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from './enum';
import { settingsPageEndowmentBuilder } from './settings-page';

describe('endowment:page-settings', () => {
  it('builds the expected permission specification', () => {
    const specification = settingsPageEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.SettingsPage,
      allowedCaveats: [SnapCaveatType.MaxRequestTime],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });
  });
});
