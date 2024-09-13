import { isMetaMaskUrl, METAMASK_URL_REGEX, parseMetaMaskUrl } from './url';

describe('METAMASK_URL_REGEX', () => {
  it('will throw for non-metamask urls', () => {
    expect('random:foobar'.match(METAMASK_URL_REGEX)).toBeNull();
  });
});

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

  it('can parse a valid url with a local snap', () => {
    expect(
      parseMetaMaskUrl('metamask://snap/local:http://localhost:8080/home'),
    ).toStrictEqual({
      authority: 'snap',
      path: '/home',
      snapId: 'local:http://localhost:8080',
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

describe('isMetaMaskUrl', () => {
  it.each(['https://www.google.com', 'metamask://foo/'])(
    'will return false for non-metamask urls',
    (url) => {
      expect(isMetaMaskUrl(url)).toBe(false);
    },
  );

  it.each(['metamask://snap/home', 'metamask://client/'])(
    'will not throw for valid metamask urls',
    (url) => {
      expect(isMetaMaskUrl(url)).toBe(true);
    },
  );
});
