import base64 from './base64';

describe('Base64 endowments', () => {
  it('has expected properties', () => {
    expect(base64).toMatchObject({
      names: ['atob', 'btoa'],
      factory: expect.any(Function),
    });
  });

  it('encodes and decodes base64', () => {
    const { atob, btoa } = base64.factory();
    expect(atob(btoa('Snaps'))).toBe('Snaps');
  });
});
