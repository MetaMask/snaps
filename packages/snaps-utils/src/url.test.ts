import { parseMetaMaskUrl } from './url';

describe('parseMetaMaskUrl', () => {
  it('can parse a valid url with the client authority', () => {
    expect(parseMetaMaskUrl('metamask://client/')).toStrictEqual({
      authority: 'client',
      path: '/',
    });
  });

  it('can parse a valid url with a namespaced snap', () => {
    expect(
      parseMetaMaskUrl('metamask://snap/npm:@metamask/examplesnap/home'),
    ).toStrictEqual({
      authority: 'snap',
      path: '/home',
      snapId: 'npm:@metamask/examplesnap',
    });
  });

  it('can parse a valid url with a non-namespaced snap', () => {
    expect(
      parseMetaMaskUrl('metamask://snap/npm:examplesnap/home'),
    ).toStrictEqual({
      authority: 'snap',
      path: '/home',
      snapId: 'npm:examplesnap',
    });
  });

  it('will throw on an invalid scheme', () => {
    expect(() => parseMetaMaskUrl('metmask://client/')).toThrow(
      'Invalid MetaMask url.',
    );
  });

  it('will throw on an invalid authority', () => {
    expect(() => parseMetaMaskUrl('metamask://bar/')).toThrow(
      'Invalid MetaMask url.',
    );
  });

  it.each([
    'metamask://snap/npm:examplesnap/foo',
    'metamask://snap/npm:@metamask/examplesnap/foo',
  ])('will throw on an invalid snap page', (url) => {
    expect(() => parseMetaMaskUrl(url)).toThrow('Invalid snap path.');
  });

  it('will throw on an invalid client page', () => {
    expect(() => parseMetaMaskUrl('metamask://client/foo')).toThrow(
      'Invalid client path.',
    );
  });
});
