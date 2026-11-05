import { installSnap } from '../src/helpers';
// eslint-disable-next-line import-x/no-unassigned-import
import '../src/global';

describe('environment', () => {
  it('installs the fixture Snap and matches the response', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWith(null);
  });
});
