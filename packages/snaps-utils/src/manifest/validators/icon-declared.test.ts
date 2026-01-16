import assert from 'assert';

import { iconDeclared } from './icon-declared';
import { getMockExtendableSnapFiles, getSnapManifest } from '../../test-utils';

describe('iconDeclared', () => {
  it('does nothing if icon is declared', async () => {
    const report = jest.fn();
    assert(iconDeclared.semanticCheck);
    await iconDeclared.semanticCheck(getMockExtendableSnapFiles(), { report });
    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if icon is not declared', async () => {
    const report = jest.fn();
    assert(iconDeclared.semanticCheck);

    const manifest = getSnapManifest();
    delete manifest.source.location.npm.iconPath;

    await iconDeclared.semanticCheck(getMockExtendableSnapFiles({ manifest }), {
      report,
    });

    expect(report).toHaveBeenCalledWith(
      'icon-declared',
      'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
    );
  });
});
