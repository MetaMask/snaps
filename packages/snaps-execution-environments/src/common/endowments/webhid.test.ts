import { rootRealmGlobal } from '../globalObject';
import Webhid from './webhid';

describe('Webhid endowment', () => {
  it('has expected properties', () => {
    expect(Webhid).toMatchObject({
      names: ['navigator'],
      factory: expect.any(Function),
    });
  });

  it('does not return the navigator from rootRealmGlobal', () => {
    const { navigator } = Webhid.factory();
    expect(navigator).not.toStrictEqual(rootRealmGlobal.navigator);
  });

  it('contains the hid key only', () => {
    const { navigator } = Webhid.factory();
    expect(Object.keys(navigator)).toContain('hid');
  });
});
