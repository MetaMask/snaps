import assert from 'assert';

import { getMockSnapFiles } from '../../test-utils';
import { iconDimensions } from './icon-dimensions';

describe('iconDimensions', () => {
  it('does nothing if icon is square', async () => {
    const svgIcon = '<svg width="25" height="25" />';

    const report = jest.fn();

    assert(iconDimensions.semanticCheck);
    await iconDimensions.semanticCheck(getMockSnapFiles({ svgIcon }), {
      report,
    });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if the icon is not square', async () => {
    const svgIcon = '<svg width="25" height="24" />';

    const report = jest.fn();

    assert(iconDimensions.semanticCheck);
    await iconDimensions.semanticCheck(getMockSnapFiles({ svgIcon }), {
      report,
    });

    expect(report).toHaveBeenCalledWith(
      'The icon in the Snap manifest is not square. It is recommended to use a square icon for the Snap.',
    );
  });
});
